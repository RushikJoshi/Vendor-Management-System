const RFQ = require("../models/RFQ");
const Vendor = require("../models/vendor.model");
const Department = require("../models/Department");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendEmail } = require("../utils/emailService");

// @desc    Create a new RFQ (Draft or Published)
// @route   POST /api/v1/rfqs
exports.createRFQ = asyncHandler(async (req, res, next) => {
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;

    // Logic for suggesting vendors based on department (only runs if department is provided)
    if (req.body.departmentId && req.body.vendorSelection?.type === 'targeted' && (!req.body.vendorSelection.targetedVendors || req.body.vendorSelection.targetedVendors.length === 0)) {
        // Automatically suggest vendors from the same department if none selected
        const suggestedVendors = await Vendor.find({ 
            tenantId: req.user.tenantId, 
            departments: req.body.departmentId,
            status: 'active'
        }).select('_id');
        req.body.vendorSelection.targetedVendors = suggestedVendors.map(v => v._id);
    }

    const rfq = await RFQ.create(req.body);

    // If published, notify vendors
    if (rfq.status === 'published') {
        const NotificationService = require("../services/NotificationService");
        await notifyVendors(rfq);

        // Notify admins about new RFQ
        NotificationService.notifyAllAdmins({
            title: "New RFQ Created",
            message: `RFQ "${rfq.title}" has been created and published.`,
            type: "rfq",
            relatedEntityId: rfq._id
        });
    }


    res.status(201).json({
        success: true,
        data: rfq,
    });
});

// @desc    Get RFQs with filters
// @route   GET /api/v1/rfqs
exports.getRFQs = asyncHandler(async (req, res, next) => {
    console.log(`📡 GET RFQs for tenant: ${req.tenantId}`);
    try {
        const tenantId = req.tenantId || req.user?.tenantId;
        const filter = { tenantId };
        
        if (req.user?.role === 'vendor') {
            filter.status = 'published';
        }

        const rfqs = await RFQ.find(filter)
            .populate('departmentId', 'name')
            .populate('vendorSelection.targetedVendors', 'name companyName email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: rfqs.length,
            data: rfqs,
        });
    } catch (err) {
        console.error("Critical RFQ Registry Failure:", err);
        return next(new AppError(`Error retrieving RFQs: ${err.message}`, 500));
    }
});

// @desc    Update RFQ status (Publish, Close, etc.)
// @route   PATCH /api/v1/rfqs/:id/status
exports.updateRFQStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const rfq = await RFQ.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user.tenantId },
        { status },
        { new: true, runValidators: true }
    );

    if (!rfq) return next(new AppError("RFQ not found", 404));

    if (status === 'published') {
        await notifyVendors(rfq);
    }

    res.status(200).json({ success: true, data: rfq });
});

// Helper function to notify vendors
async function notifyVendors(rfq) {
    let vendorEmails = [];
    
    if (rfq.vendorSelection.type === 'open') {
        // Notify all active vendors in the tenant
        const vendors = await Vendor.find({ tenantId: rfq.tenantId, status: 'active' }).select('email');
        vendorEmails = vendors.map(v => v.email);
    } else {
        // Notify only targeted vendors
        const vendors = await Vendor.find({ _id: { $in: rfq.vendorSelection.targetedVendors } }).select('email');
        vendorEmails = vendors.map(v => v.email);
    }

    // Send emails (In a real app, use a queue like Bull)
    for (const email of vendorEmails) {
        try {
            await sendEmail({
                to: email,
                subject: `New RFQ: ${rfq.title}`,
                text: `A new Request for Quotation has been published. \n\nTitle: ${rfq.title}\nDeadline: ${rfq.quoteDeadline.toLocaleDateString()}`,
            });
        } catch (err) {
            console.error(`Failed to notify vendor: ${email}`, err);
        }
    }
}

// Inherit getRFQ and updateRFQ from existing file logic if needed, 
// but optimized for new schema below:

exports.getRFQ = asyncHandler(async (req, res, next) => {
    const rfq = await RFQ.findOne({ 
        _id: req.params.id, 
        tenantId: req.user.tenantId 
    }).populate('departmentId', 'name').populate('vendorSelection.targetedVendors', 'name companyName email');

    if (!rfq) return next(new AppError("RFQ not found", 404));

    res.status(200).json({ success: true, data: rfq });
});

exports.updateRFQ = asyncHandler(async (req, res, next) => {
    const rfq = await RFQ.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user.tenantId },
        req.body,
        { new: true, runValidators: true }
    );
    if (!rfq) return next(new AppError("RFQ not found", 404));
    res.status(200).json({ success: true, data: rfq });
});
