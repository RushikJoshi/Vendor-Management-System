const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @desc    Submit a quotation for an RFQ
// @route   POST /api/v1/quotations
// @access  Private (Vendor)
exports.submitQuotation = asyncHandler(async (req, res, next) => {
    const { rfqId } = req.body;

    // Check if RFQ exists and is open
    const rfq = await RFQ.findOne({ _id: rfqId, tenantId: req.user.tenantId });
    if (!rfq) {
        return next(new AppError("RFQ not found", 404));
    }
    if (rfq.status !== 'open') {
        return next(new AppError("RFQ is not open for quotations", 400));
    }

    req.body.tenantId = req.user.tenantId;
    req.body.submittedBy = req.user._id;
    // req.body.vendorId = ... (fetch from user profile)

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
    const quotations = await Quotation.find({ 
        rfqId: req.params.rfqId, 
        tenantId: req.user.tenantId 
    }).populate('vendorId', 'name email companyName');

    res.status(200).json({
        success: true,
        count: quotations.length,
        data: quotations,
    });
});
