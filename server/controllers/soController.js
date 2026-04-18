const PurchaseOrder = require("../models/PurchaseOrder");
const Quotation = require("../models/Quotation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { generateSO } = require("../utils/pdfGenerator");
const SequenceService = require("../services/SequenceService");

exports.createSO = asyncHandler(async (req, res, next) => {
    const { quotationId, startDate, endDate, location } = req.body;

    const quotation = await Quotation.findById(quotationId).populate('vendorId');
    if (!quotation) {
        return next(new AppError("Quotation not found", 404));
    }

    const soNumber = await SequenceService.getNextSequence(req.user.tenantId, "so");
    
    const soData = {
        poNumber: soNumber, // We map SO number to poNumber field in model
        orderType: "SO",
        rfqId: quotation.rfqId,
        vendorId: quotation.vendorId._id,
        quotationId: quotation._id,
        items: quotation.items.map(item => ({
            name: "Work Service", // Should fetch from RFQ
            quantity: 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
        })),
        totalAmount: quotation.totalAmount,
        servicePeriod: {
            startDate: startDate || new Date(),
            endDate: endDate || new Date(Date.now() + 30*24*60*60*1000) // Default 30 days
        },
        serviceLocation: location || "As per Site Requirement",
        tenantId: req.user.tenantId,
        createdBy: req.user._id
    };

    // Generate PDF
    const pdfUrl = await generateSO({
        soNumber: soNumber,
        vendorName: quotation.vendorId.name,
        items: soData.items,
        totalAmount: soData.totalAmount,
        location: soData.serviceLocation,
        startDate: soData.servicePeriod.startDate,
        endDate: soData.servicePeriod.endDate
    });

    soData.pdfUrl = pdfUrl;

    const so = await PurchaseOrder.create(soData);

    res.status(201).json({
        success: true,
        data: so,
    });
});

exports.getSOs = asyncHandler(async (req, res, next) => {
    const query = { 
        tenantId: req.user.tenantId,
        orderType: "SO" 
    };
    
    // RBAC: Vendor list only their own
    if (req.user.role === 'vendor') {
        const Vendor = require("../models/vendor.model");
        const vendor = await Vendor.findOne({ userId: req.user._id });
        if (!vendor) return res.status(200).json({ success: true, data: [] });
        query.vendorId = vendor._id;
    }

    const sos = await PurchaseOrder.find(query)
        .populate('vendorId', 'name companyName')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: sos,
    });
});
