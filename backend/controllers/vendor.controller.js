const cloudinary = require("../config/cloudinary");
const Vendor = require("../models/vendor.model");
const APIFeatures = require("../utils/apiFeatures");
const { successResponse } = require("../utils/responseHandler");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");
const logActivity = require("../utils/logActivity");

// @desc    Upload GST Certificate
// @route   PUT /api/vendors/:id/upload-gst
// @access  Private/Admin
exports.uploadGST = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload a file", 400));
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    // Delete old file from Cloudinary if exists
    if (vendor.gstCertificate && vendor.gstCertificate.public_id) {
        await cloudinary.uploader.destroy(vendor.gstCertificate.public_id);
    }

    // Update DB
    vendor.gstCertificate = {
        public_id: req.file.filename, // Multer-storage-cloudinary gives the public_id here
        url: req.file.path, // The secure URL
    };
    await vendor.save();

    // LOG ACTIVITY
    logActivity({
        action: "GST_UPLOADED",
        entityType: "Vendor",
        entityId: vendor._id,
        performedBy: req.user.id,
        newData: { url: vendor.gstCertificate.url },
        ipAddress: req.ip,
    });

    res.status(200).json({
        success: true,
        message: "GST Certificate uploaded successfully",
        data: {
            gstCertificate: {
                url: vendor.gstCertificate.url,
            },
        },
    });
});

// @desc    Upload Agreement File
// @route   PUT /api/vendors/:id/upload-agreement
// @access  Private/Admin
exports.uploadAgreement = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload a file", 400));
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    // Delete old file from Cloudinary if exists
    if (vendor.agreementFile && vendor.agreementFile.public_id) {
        await cloudinary.uploader.destroy(vendor.agreementFile.public_id);
    }

    // Update DB
    vendor.agreementFile = {
        public_id: req.file.filename,
        url: req.file.path,
    };
    await vendor.save();

    // LOG ACTIVITY
    logActivity({
        action: "AGREEMENT_UPLOADED",
        entityType: "Vendor",
        entityId: vendor._id,
        performedBy: req.user.id,
        newData: { url: vendor.agreementFile.url },
        ipAddress: req.ip,
    });

    res.status(200).json({
        success: true,
        message: "Agreement document uploaded successfully",
        data: {
            agreementFile: {
                url: vendor.agreementFile.url,
            },
        },
    });
});

// @desc    Get Current Vendor Profile
// @route   GET /api/vendors/me
// @access  Private (Vendor only)
exports.getMe = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
        // Fallback for admins testing or if not linked yet
        const adminVendor = await Vendor.findOne({ email: req.user.email });
        if (!adminVendor) {
            // No profile found, but return 200 null to allow frontend to handle it cleanly
            return successResponse(res, "No vendor profile found for this account", null);
        }
        return successResponse(res, "Vendor profile fetched", adminVendor);
    }


    successResponse(res, "Vendor profile fetched", vendor);
});

// @desc    Update Current Vendor Profile
// @route   PUT /api/vendors/me
// @access  Private (Vendor only)
exports.updateMe = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
        return next(new AppError("Vendor profile not found! Please complete your registration first.", 404));
    }

    // Only allow updating certain fields (prevent escalation)
    const allowedFields = ["name", "phone", "address", "companyName", "serviceType", "contactPerson"];
    const updateData = {};
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) updateData[key] = req.body[key];
    });

    const updated = await Vendor.findByIdAndUpdate(vendor._id, updateData, {
        new: true,
        runValidators: true
    });

    successResponse(res, "Profile updated successfully", updated);
});


// @desc    Create a new vendor
// @route   POST /api/vendors
// @access  Private/Admin
exports.createVendor = asyncHandler(async (req, res, next) => {
    const { email, gstNumber } = req.body;


    // Duplication check (Email & GST Number)
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
        return next(new AppError("Email is already in use", 400));
    }

    const existingGST = await Vendor.findOne({ gstNumber });
    if (existingGST) {
        return next(new AppError("GST Number is already in use", 400));
    }

    // Assign Creator ID
    req.body.createdBy = req.user.id;

    const vendor = await Vendor.create(req.body);

    // LOG ACTIVITY
    logActivity({
        action: "VENDOR_CREATED",
        entityType: "Vendor",
        entityId: vendor._id,
        performedBy: req.user.id,
        newData: vendor,
        ipAddress: req.ip,
    });

    // NOTIFY ADMINS
    const NotificationService = require("../services/NotificationService");
    NotificationService.notifyAllAdmins({
        title: "New Vendor Registered",
        message: `${vendor.name} (${vendor.companyName}) has been registered.`,
        type: "vendor",
        relatedEntityId: vendor._id
    });


    // SEND WELCOME EMAIL (Non-blocking)
    sendEmail({
        to: vendor.email,
        subject: "Welcome to Vendor Management System",
        templateName: "vendorCreated",
        placeholders: {
            name: vendor.name,
            companyName: vendor.companyName || "N/A",
        },
    });

    successResponse(res, "Vendor created successfully", vendor, 201);
});


// @desc    Get all vendors with search, filter, paginate
// @route   GET /api/vendors
// @access  Private
exports.getAllVendors = asyncHandler(async (req, res, next) => {
    // 1) Get total results count for metadata
    // We create a separate features instance just for counting to ignore pagination
    const countFeatures = new APIFeatures(Vendor.find(), req.query).search().filter();
    const totalResults = await countFeatures.query.countDocuments();

    // 2) Initialize APIFeatures for actual data retrieval
    const features = new APIFeatures(
        Vendor.find().populate("createdBy", "name email"),
        req.query
    )
        .search()
        .filter()
        .sort()
        .paginate();

    const vendors = await features.query;

    // 3) Calculate pagination metadata
    const resultsPerPage = parseInt(req.query.limit, 10) || 10;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    res.status(200).json({
        success: true,
        message: "Vendors fetched successfully",
        totalResults,
        currentPage,
        totalPages,
        resultsPerPage,
        data: vendors,
    });
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendorById = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id).populate("createdBy", "name email");

    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    successResponse(res, "Vendor details fetched successfully", vendor);
});

// @desc    Update vendor details
// @route   PATCH /api/vendors/:id
// @access  Private/Admin
exports.updateVendor = asyncHandler(async (req, res, next) => {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    const oldData = vendor.toObject();

    // Update using findByIdAndUpdate for partial update tracking & validation
    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    // LOG ACTIVITY
    logActivity({
        action: "VENDOR_UPDATED",
        entityType: "Vendor",
        entityId: vendor._id,
        performedBy: req.user.id,
        oldData,
        newData: vendor.toObject(),
        ipAddress: req.ip,
    });

    successResponse(res, "Vendor updated successfully", vendor);
});

// @desc    Soft Delete Vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
exports.deleteVendor = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    // Set soft delete flag
    vendor.isDeleted = true;
    await vendor.save();

    // LOG ACTIVITY
    logActivity({
        action: "VENDOR_DELETED",
        entityType: "Vendor",
        entityId: vendor._id,
        performedBy: req.user.id,
        ipAddress: req.ip,
    });

    successResponse(res, "Vendor deleted successfully", null);
});

// @desc    Get Vendor Performance Metrics
// @route   GET /api/vendors/:id/performance
// @access  Private (Admin + User)
exports.getVendorPerformance = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id).select(
        "name totalOrders completedOrders pendingPayments onTimeDeliveries rating"
    );

    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    // Prepare response data (virtual 'onTimeDeliveryPercentage' will be included automatically because we enabled virtuals)
    const performanceData = {
        totalOrders: vendor.totalOrders,
        completedOrders: vendor.completedOrders,
        pendingPayments: vendor.pendingPayments,
        onTimeDeliveryPercentage: vendor.onTimeDeliveryPercentage,
        rating: vendor.rating,
    };

    successResponse(res, "Vendor performance fetched successfully", performanceData);
});

// @desc    Send Payment Reminder Email
// @route   POST /api/vendors/:id/remind-payment
// @access  Private/Admin
exports.sendPaymentReminder = asyncHandler(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
        return next(new AppError("Vendor not found", 404));
    }

    if (!vendor.pendingPayments || vendor.pendingPayments <= 0) {
        return next(new AppError("This vendor has no pending payments", 400));
    }

    // SEND REMINDER EMAIL
    await sendEmail({
        to: vendor.email,
        subject: "Payment Reminder",
        templateName: "paymentReminder",
        placeholders: {
            name: vendor.name,
            companyName: vendor.companyName || "Your Company",
            amount: vendor.pendingPayments.toLocaleString("en-IN"),
        },
    });

    successResponse(res, "Payment reminder sent successfully", null);
});
