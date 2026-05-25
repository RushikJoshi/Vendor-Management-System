const PurchaseOrder = require("../models/PurchaseOrder");
const Quotation = require("../models/Quotation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { generatePO } = require("../utils/pdfGenerator");
const SequenceService = require("../services/SequenceService");
const ProcurementSettings = require("../models/ProcurementSettings");
const numberToWords = require("../utils/numberToWords");

exports.createPO = asyncHandler(async (req, res, next) => {
    const { quotationId } = req.body;

    const quotation = await Quotation.findById(quotationId).populate('vendorId').populate('rfqId');
    if (!quotation) {
        return next(new AppError("Quotation not found", 404));
    }

    const settings = await ProcurementSettings.findOne({ tenantId: req.user.tenantId });
    const poConfig = settings ? settings.PO : {};

    const poNumber = await SequenceService.getNextSequence(req.user.tenantId, "po");
    
    const vendor = quotation.vendorId;
    const rfq = quotation.rfqId;

    const poData = {
        poNumber,
        rfqId: rfq?._id,
        vendorId: vendor._id,
        quotationId: quotation._id,
        vendorName: vendor.companyName || vendor.name,
        vendorAddress: `${vendor.address?.city || ''}, ${vendor.address?.state || ''}, ${vendor.address?.pincode || ''}`,
        vendorCity: vendor.address?.city || 'N/A',
        vendorState: vendor.address?.state || 'N/A',
        vendorPincode: vendor.address?.pincode || 'N/A',
        vendorMSME: vendor.msmeStatus || vendor.msmeNumber || 'N/A',
        vendorPAN: vendor.gstNumber ? vendor.gstNumber.substring(2, 12) : 'N/A',
        vendorGST: vendor.gstNumber || 'N/A',
        vendorPhone: vendor.phone || 'N/A',
        vendorEmail: vendor.email || 'N/A',
        vendorContactPerson: vendor.name,
        vendorCode: vendor.vendorId || 'N/A',
        items: quotation.items.map(qItem => {
            const rfqItem = rfq?.items?.find(ri => String(ri._id) === String(qItem.rfqItemId));
            return {
                name: rfqItem?.name || "Operational Component",
                quantity: qItem.quantity || rfqItem?.quantity || 1,
                unitPrice: qItem.unitPrice,
                totalPrice: qItem.totalPrice,
                specifications: rfqItem?.specifications || '',
                hsn: rfqItem?.hsn || '847130',
                uom: rfqItem?.unit || 'Nos'
            };
        }),
        totalAmount: quotation.totalAmount,
        totalAmountInWords: numberToWords(Math.round(quotation.totalAmount * 1.18)), // Including 18% GST for words
        tenantId: req.user.tenantId,
        createdBy: req.user._id
    };

    // Generate PDF with settings
    const pdfUrl = await generatePO(poData, {
        companyName: poConfig?.get('companyName') || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED',
        companyAddress: poConfig?.get('companyAddress'),
        companyWebsite: poConfig?.get('companyWebsite'),
        cin: poConfig?.get('cin'),
        gstNumber: poConfig?.get('gstNumber'),
        jurisdiction: poConfig?.get('jurisdiction'),
        billingAddress: poConfig?.get('billingAddress'),
        deliveryAddress: poConfig?.get('deliveryAddress'),
    });

    poData.pdfUrl = pdfUrl;

    const po = await PurchaseOrder.create(poData);

    res.status(201).json({
        success: true,
        data: po,
    });
});

exports.getPOs = asyncHandler(async (req, res, next) => {
    const query = { tenantId: req.user.tenantId };
    
    // RBAC: Vendor list only their own
    if (req.user.role === 'vendor') {
        const Vendor = require("../models/vendor.model");
        const vendor = await Vendor.findOne({ userId: req.user._id });
        if (!vendor) return res.status(200).json({ success: true, data: [] });
        query.vendorId = vendor._id;
    }

    const pos = await PurchaseOrder.find(query)
        .populate('vendorId', 'name companyName email phone address bankAccount gstNumber vendorId')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: pos,
    });
});

exports.regenerateAllPOs = asyncHandler(async (req, res, next) => {
    const query = req.user ? { tenantId: req.user.tenantId } : {};
    const orders = await PurchaseOrder.find(query).populate('vendorId');
    
    const results = [];
    for (const order of orders) {
        const settings = await ProcurementSettings.findOne({ tenantId: order.tenantId });
        const poConfig = settings ? settings.PO : {};

        const vendor = order.vendorId;
        const poData = {
            poNumber: order.poNumber,
            vendorName: vendor?.companyName || vendor?.name || 'N/A',
            vendorAddress: `${vendor?.address?.city || ''}, ${vendor?.address?.state || ''}, ${vendor?.address?.pincode || ''}`,
            vendorCity: vendor?.address?.city || 'N/A',
            vendorState: vendor?.address?.state || 'N/A',
            vendorPincode: vendor?.address?.pincode || 'N/A',
            vendorMSME: vendor?.msmeStatus || vendor?.msmeNumber || 'N/A',
            vendorPAN: vendor?.gstNumber ? vendor.gstNumber.substring(2, 12) : 'N/A',
            vendorGST: vendor?.gstNumber || 'N/A',
            vendorPhone: vendor?.phone || 'N/A',
            vendorEmail: vendor?.email || 'N/A',
            vendorContactPerson: vendor?.name,
            vendorCode: vendor?.vendorId || 'N/A',
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                hsn: '847130',
                uom: 'Nos'
            })),
            totalAmount: order.totalAmount,
            totalAmountInWords: numberToWords(Math.round(order.totalAmount * 1.18))
        };

        const pdfUrl = await generatePO(poData, {
            companyName: poConfig?.get('companyName') || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED',
            companyAddress: poConfig?.get('companyAddress'),
            companyWebsite: poConfig?.get('companyWebsite'),
            cin: poConfig?.get('cin'),
            gstNumber: poConfig?.get('gstNumber'),
            jurisdiction: poConfig?.get('jurisdiction'),
            billingAddress: poConfig?.get('billingAddress'),
            deliveryAddress: poConfig?.get('deliveryAddress'),
        });

        order.pdfUrl = pdfUrl;
        await order.save();
        results.push({ poNumber: order.poNumber, status: 'Success' });
    }

    res.status(200).json({
        success: true,
        message: `${results.length} POs regenerated successfully.`,
        data: results
    });
});

exports.getPOById = asyncHandler(async (req, res, next) => {
    const po = await PurchaseOrder.findById(req.params.id)
        .populate('vendorId', 'name companyName email phone address bankAccount gstNumber vendorId')
        .populate('rfqId', 'title');

    if (!po) {
        return next(new AppError("Purchase Order not found", 404));
    }

    // RBAC: Vendor can only see their own
    if (req.user.role === 'vendor') {
        const Vendor = require("../models/vendor.model");
        const vendor = await Vendor.findOne({ userId: req.user._id });
        if (!vendor || String(vendor._id) !== String(po.vendorId._id)) {
            return next(new AppError("Not authorized to view this order", 403));
        }
    }

    res.status(200).json({
        success: true,
        data: po
    });
});
