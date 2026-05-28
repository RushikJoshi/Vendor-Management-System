const Client = require("../models/Client");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");
const configs = require("../config/env");

const sanitizeClientPayload = (payload = {}) => ({
    name: payload.name,
    companyName: payload.companyName,
    email: payload.email ? String(payload.email).trim().toLowerCase() : payload.email,
    phone: payload.phone,
    address: payload.address,
    gstin: payload.gstin,
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = asyncHandler(async (req, res, next) => {
    const payload = sanitizeClientPayload(req.body);
    const existing = await Client.findOne({ tenantId: req.user.tenantId, email: payload.email });
    if (existing) {
        return next(new AppError("Client with this email already exists for this tenant.", 400));
    }

    const client = await Client.create({
        ...payload,
        tenantId: req.user.tenantId,
        createdBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        data: client,
    });
});

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res, next) => {
    const clients = await Client.find({ tenantId: req.user.tenantId })
                                .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: clients.length,
        data: clients,
    });
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = asyncHandler(async (req, res, next) => {
    const client = await Client.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!client) {
        return next(new AppError("Client not found", 404));
    }

    res.status(200).json({
        success: true,
        data: client,
    });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = asyncHandler(async (req, res, next) => {
    let client = await Client.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!client) {
        return next(new AppError("Client not found", 404));
    }

    client = await Client.findByIdAndUpdate(req.params.id, sanitizeClientPayload(req.body), {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: client,
    });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = asyncHandler(async (req, res, next) => {
    const client = await Client.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!client) {
        return next(new AppError("Client not found", 404));
    }

    await client.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});

// @desc    Create login for client
// @route   POST /api/clients/:id/create-login
// @access  Private
exports.createClientLogin = asyncHandler(async (req, res, next) => {
    const client = await Client.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!client) {
        return next(new AppError("Client not found", 404));
    }

    if (!client.email) {
        return next(new AppError("Client must have an email address to create a login", 400));
    }

    // Check if user already exists
    let user = await User.findOne({ email: client.email, tenantId: req.user.tenantId });
    if (user) {
        return next(new AppError("A user with this email already exists", 400));
    }

    // Generate a cryptographically strong temporary password.
    const crypto = require("crypto");
    const generatedPassword = crypto.randomBytes(12).toString("base64url");

    // Create user
    user = await User.create({
        name: client.name || client.companyName,
        email: client.email,
        password: generatedPassword,
        role: "client",
        tenantId: req.user.tenantId,
        clientId: client._id,
        mustChangePassword: true
    });

    let emailSent = false;
    try {
        const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to the Client Portal</h2>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 15px;">Your digital workspace is ready</p>
          </div>
          <div style="padding: 40px 32px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #334155; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #334155; margin-bottom: 32px; line-height: 1.6;">Your exclusive client portal account has been successfully created. You can now log in to view your sales orders, download invoices, and track your account status in real-time.</p>
            
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
              <h3 style="margin-top: 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">Your Secure Credentials</h3>
              
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">Email / Username</p>
                <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">${user.email}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">Temporary Password</p>
                <p style="margin: 0; color: #4f46e5; font-size: 28px; font-weight: 900; letter-spacing: 0.15em; font-family: 'Courier New', monospace; background: #eef2ff; display: inline-block; padding: 8px 16px; border-radius: 8px;">${generatedPassword}</p>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${configs.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Access Client Portal</a>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-bottom: 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;"><em>For your security, please log in and change your password immediately.</em></p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
            &copy; ${new Date().getFullYear()} Vendor Management System. All rights reserved.
          </div>
        </div>
        `;

        await sendEmail({
            to: user.email,
            subject: "Your Client Portal Login Credentials",
            html: emailHtml
        });
        emailSent = true;
    } catch (err) {
        console.error("Failed to send email to client:", err.message);
    }

    res.status(201).json({
        success: true,
        message: emailSent
            ? "Client login created successfully. Temporary credentials were sent by email."
            : "Client login created, but credential email could not be sent.",
        data: {
            email: user.email,
            emailSent,
        }
    });
});
