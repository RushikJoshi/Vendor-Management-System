const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const Vendor = require("../models/vendor.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { normalizeRole } = require("../config/roles");
const NotificationService = require("../services/NotificationService");

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

    await NotificationService.notifyInternalUsers(
        req.user.tenantId,
        {
            title: "New Quotation Submitted",
            message: `${vendor.companyName || vendor.name || req.user.name || "A vendor"} submitted a quotation for RFQ "${rfq.title}".`,
            type: "quotation",
            relatedEntityId: rfq._id,
        },
        { excludeUserId: req.user._id }
    );

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

// @desc    Reject a quotation
// @route   POST /api/v1/quotations/:id/reject
// @access  Private (Admin)
exports.rejectQuotation = asyncHandler(async (req, res, next) => {
    const quotation = await Quotation.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!quotation) return next(new AppError("Quotation not found", 404));

    if (quotation.status === "accepted") {
        return next(new AppError("Accepted quotation cannot be rejected", 400));
    }

    if (quotation.status === "rejected") {
        return res.status(200).json({
            success: true,
            message: "Quotation already rejected",
            data: quotation,
        });
    }

    quotation.status = "rejected";
    await quotation.save();

    res.status(200).json({
        success: true,
        message: "Quotation rejected successfully",
        data: quotation,
    });
});

// @desc    Accept a quotation and formalize into a contract
// @route   POST /api/v1/quotations/:id/accept
// @access  Private (Admin)
exports.acceptQuotation = asyncHandler(async (req, res, next) => {
    const quotation = await Quotation.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!quotation) return next(new AppError("Quotation or registry mismatch", 404));

    console.log("[Quotation] Accepting quotation:", quotation._id, "for RFQ:", quotation.rfqId);

    // 1. Mark winning quotation as accepted
    quotation.status = "accepted";
    await quotation.save();
    console.log("[Quotation] Marked as accepted");

    // 2. Mark other concurrent quotations for the same RFQ as rejected
    await Quotation.updateMany(
        { rfqId: quotation.rfqId, _id: { $ne: quotation._id }, tenantId: req.user.tenantId },
        { status: "rejected" }
    );
    console.log("[Quotation] Others rejected");

    // 3. Mark RFQ as terminated/closed for the procurement cycle
    const rfq = await RFQ.findByIdAndUpdate(quotation.rfqId, { status: "closed" }, { new: true });
    if (!rfq) return next(new AppError("Associated RFQ node not found", 404));
    console.log("[Quotation] RFQ marked as closed:", rfq._id);

    // 4. Provision formal Contract node (Master Agreement)
    const Contract = require("../models/Contract");
    const PurchaseOrder = require("../models/PurchaseOrder");
    const ProcurementSettings = require("../models/ProcurementSettings");
    const { generatePO, generateSO } = require("../utils/pdfGenerator");
    const orderType = req.body.orderType || "PO";

    // Fetch Custom Branding/Terms specifically for this order type from Unified doc
    let doc = await ProcurementSettings.findOne({ tenantId: req.user.tenantId });
    if (!doc) {
        doc = await ProcurementSettings.create({ 
            tenantId: req.user.tenantId,
            PO: {}, // Will use defaults in model or controller
            SO: {} 
        });
    }
    const settings = doc[orderType] || {};

    console.log(`[Quotation] Creating Contract & ${orderType}...`);
    
    // Calculate Sequential Order Number
    const existingCount = await PurchaseOrder.countDocuments({ tenantId: req.user.tenantId, orderType: orderType });
    
    // Build Number based on settings
    const prefix = orderType === "SO" ? (settings.soPrefix || "SO-") : (settings.poPrefix || "PO-");
    const suffix = orderType === "SO" ? (settings.soSuffix || "") : (settings.poSuffix || "");
    const startNum = orderType === "SO" ? (settings.soStartNumber || 1) : (settings.poStartNumber || 1);
    
    const nextSeq = startNum + existingCount;
    const orderNumber = `${prefix}${nextSeq.toString().padStart(4, '0')}${suffix}`;
    
    const contractNumber = `CNT-${Date.now().toString().slice(-6)}-${rfq._id.toString().slice(-4)}`.toUpperCase();
    
    // Create Contract
    const contract = await Contract.create({
        vendorId: quotation.vendorId,
        contractTitle: `Operational Mandate: ${rfq.title}`,
        contractNumber: contractNumber,
        startDate: new Date(),
        endDate: rfq.deliveryDeadline || new Date(Date.now() + 31536000000), 
        contractValue: quotation.totalAmount,
        status: 'active',
        rfqId: rfq._id,
        quotationId: quotation._id,
        tenantId: req.user.tenantId,
        createdBy: req.user._id
    });

    // Create Purchase Order / Service Order (Execution Node)
    const poItems = quotation.items.map(quoteItem => {
        const rfqItem = rfq.items.find(ri => String(ri._id) === String(quoteItem.rfqItemId));
        return {
            name: quoteItem.notes || rfqItem?.name || "Operational Requirement",
            quantity: rfqItem?.quantity || 1,
            unitPrice: quoteItem.unitPrice,
            totalPrice: quoteItem.unitPrice * (rfqItem?.quantity || 1)
        };
    });

    const vendor = await Vendor.findById(quotation.vendorId);

    // Generate PDF based on type
    let pdfUrl = "";
    if (orderType === "SO") {
        pdfUrl = await generateSO({
            soNumber: orderNumber,
            vendorName: vendor?.companyName || vendor?.name || "Vendor",
            items: poItems,
            totalAmount: quotation.totalAmount,
            location: "As per Site Requirement",
            startDate: new Date(),
            endDate: rfq.deliveryDeadline || new Date(Date.now() + 31536000000)
        }, settings);
    } else {
        pdfUrl = await generatePO({
            poNumber: orderNumber,
            vendorName: vendor?.companyName || vendor?.name || "Vendor",
            items: poItems,
            totalAmount: quotation.totalAmount
        }, settings);
    }

    const order = await PurchaseOrder.create({
        poNumber: orderNumber,
        orderType: orderType,
        rfqId: rfq._id,
        vendorId: quotation.vendorId,
        quotationId: quotation._id,
        items: poItems,
        totalAmount: quotation.totalAmount,
        status: 'sent',
        pdfUrl: pdfUrl,
        tenantId: req.user.tenantId,
        createdBy: req.user._id
    });

    res.status(200).json({
        success: true,
        message: `Procurement Cycle Formalized: Contract & ${orderType} Provisioned.`,
        data: {
            quotation,
            contract,
            order: order
        }
    });
});
