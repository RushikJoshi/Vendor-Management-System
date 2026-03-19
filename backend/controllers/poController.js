const PurchaseOrder = require("../models/PurchaseOrder");
const Quotation = require("../models/Quotation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { generatePO } = require("../utils/pdfGenerator");

exports.createPO = asyncHandler(async (req, res, next) => {
    const { quotationId } = req.body;

    const quotation = await Quotation.findById(quotationId).populate('vendorId');
    if (!quotation) {
        return next(new AppError("Quotation not found", 404));
    }

    const poNumber = `PO-${Date.now()}`;
    
    const poData = {
        poNumber,
        rfqId: quotation.rfqId,
        vendorId: quotation.vendorId._id,
        quotationId: quotation._id,
        items: quotation.items.map(item => ({
            name: "Item", // Should fetch from RFQ
            quantity: 1, // Placeholder
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
        })),
        totalAmount: quotation.totalAmount,
        tenantId: req.user.tenantId,
        createdBy: req.user._id
    };

    // Generate PDF
    const pdfUrl = await generatePO({
        poNumber,
        vendorName: quotation.vendorId.name,
        items: poData.items,
        totalAmount: poData.totalAmount
    });

    poData.pdfUrl = pdfUrl;

    const po = await PurchaseOrder.create(poData);

    res.status(201).json({
        success: true,
        data: po,
    });
});

exports.getPOs = asyncHandler(async (req, res, next) => {
    const pos = await PurchaseOrder.find({ tenantId: req.user.tenantId })
        .populate('vendorId', 'name companyName')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: pos,
    });
});
