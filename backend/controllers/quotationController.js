const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const Vendor = require("../models/vendor.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { normalizeRole } = require("../config/roles");

const resolveVendorProfile = async (user) => {
    if (!user) return null;
    let vendor = await Vendor.findOne({ userId: user._id || user.id, tenantId: user.tenantId });
    if (!vendor && user.email) {
        vendor = await Vendor.findOne({ email: user.email, tenantId: user.tenantId });
    }
    return vendor;
};

// @desc    Submit a quotation for an RFQ
// @route   POST /api/v1/quotations
// @access  Private (Vendor)
exports.submitQuotation = asyncHandler(async (req, res, next) => {
    const { rfqId } = req.body;
    const requesterRole = normalizeRole(req.user?.role);
    if (requesterRole !== "vendor") {
        return next(new AppError("Only vendors can submit quotations", 403));
    }

    // Check if RFQ exists and is open
    const rfq = await RFQ.findOne({ _id: rfqId, tenantId: req.user.tenantId });
    if (!rfq) {
        return next(new AppError("RFQ not found", 404));
    }
    if (rfq.status !== "open" && rfq.status !== "published") {
        return next(new AppError("RFQ is not open for quotations", 400));
    }

    const vendor = await resolveVendorProfile(req.user);
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }
    const isTargeted = rfq.vendorSelection?.type === "targeted";
    const isAssigned =
        !isTargeted ||
        (Array.isArray(rfq.vendorSelection?.targetedVendors) &&
            rfq.vendorSelection.targetedVendors.some((id) => String(id) === String(vendor._id)));
    if (!isAssigned) {
        return next(new AppError("You are not assigned to this RFQ", 403));
    }

    req.body.tenantId = req.user.tenantId;
    req.body.submittedBy = req.user._id;
    req.body.vendorId = vendor._id;

    const alreadySubmitted = await Quotation.findOne({
        tenantId: req.user.tenantId,
        rfqId,
        vendorId: vendor._id,
    });
    if (alreadySubmitted) {
        return next(new AppError("Quotation already submitted for this RFQ", 409));
    }

    const quotation = await Quotation.create(req.body);

    res.status(201).json({
        success: true,
        data: quotation,
    });
});

// @desc    Get quotations for a specific RFQ (Comparison)
// @route   GET /api/v1/rfqs/:rfqId/quotations
// @access  Private (Admin)
exports.getQuotationsByRFQ = asyncHandler(async (req, res, next) => {
    const requesterRole = normalizeRole(req.user?.role);
    const filter = {
        rfqId: req.params.rfqId,
        tenantId: req.user.tenantId,
    };

    if (requesterRole === "vendor") {
        const vendor = await resolveVendorProfile(req.user);
        if (!vendor) return next(new AppError("Vendor profile not found", 404));
        filter.vendorId = vendor._id;
    }

    const quotations = await Quotation.find(filter).populate('vendorId', 'name email companyName');

    res.status(200).json({
        success: true,
        count: quotations.length,
        data: quotations,
    });
});
