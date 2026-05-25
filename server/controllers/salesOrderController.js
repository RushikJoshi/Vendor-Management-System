const SalesOrder = require("../models/SalesOrder");
const Client = require("../models/Client");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// Mock PDF Generator for Sales Order
const generateSalesOrderPDF = async (soData) => {
    // In a real scenario, use PDFKit similar to pdfGenerator.js
    return `/uploads/so/${soData.soNumber}.pdf`;
};

// @desc    Create new Sales Order
// @route   POST /api/sales-orders
// @access  Private
exports.createSalesOrder = asyncHandler(async (req, res, next) => {
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;

    // Generate SO Number (mock sequence for now)
    const count = await SalesOrder.countDocuments({ tenantId: req.user.tenantId });
    req.body.soNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Calculate total amount if not provided
    if (!req.body.totalAmount && req.body.items) {
        req.body.totalAmount = req.body.items.reduce((acc, item) => {
            item.totalPrice = item.quantity * item.unitPrice;
            return acc + item.totalPrice;
        }, 0);
    }

    let salesOrder = await SalesOrder.create(req.body);

    // Mock PDF generation
    const pdfUrl = await generateSalesOrderPDF(salesOrder);
    salesOrder.pdfUrl = pdfUrl;
    await salesOrder.save();

    salesOrder = await salesOrder.populate('clientId');

    res.status(201).json({
        success: true,
        data: salesOrder,
    });
});

// @desc    Get all Sales Orders
// @route   GET /api/sales-orders
// @access  Private
exports.getSalesOrders = asyncHandler(async (req, res, next) => {
    let filter = { tenantId: req.user.tenantId };
    if (req.user.role === 'client') {
        filter.clientId = req.user.clientId;
    }

    const salesOrders = await SalesOrder.find(filter)
                                .populate('clientId', 'name companyName email phone')
                                .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: salesOrders.length,
        data: salesOrders,
    });
});

// @desc    Get single Sales Order
// @route   GET /api/sales-orders/:id
// @access  Private
exports.getSalesOrder = asyncHandler(async (req, res, next) => {
    let filter = {
        _id: req.params.id,
        tenantId: req.user.tenantId
    };
    if (req.user.role === 'client') {
        filter.clientId = req.user.clientId;
    }

    const salesOrder = await SalesOrder.findOne(filter).populate('clientId');

    if (!salesOrder) {
        return next(new AppError("Sales Order not found", 404));
    }

    res.status(200).json({
        success: true,
        data: salesOrder,
    });
});

// @desc    Update Sales Order Status
// @route   PUT /api/sales-orders/:id/status
// @access  Private
exports.updateSalesOrderStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    let salesOrder = await SalesOrder.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!salesOrder) {
        return next(new AppError("Sales Order not found", 404));
    }

    salesOrder.status = status;
    await salesOrder.save();

    res.status(200).json({
        success: true,
        data: salesOrder,
    });
});

// @desc    Process Client Payment for Sales Order
// @route   POST /api/sales-orders/:id/pay
// @access  Private (Client)
exports.paySalesOrder = asyncHandler(async (req, res, next) => {
    const { paymentMethod, reference, amount } = req.body;
    
    let salesOrder = await SalesOrder.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!salesOrder) {
        return next(new AppError("Sales Order not found", 404));
    }
    
    if (salesOrder.status === 'Paid') {
        return next(new AppError("Order is already paid", 400));
    }

    // Update status to Paid and save payment metadata
    salesOrder.status = 'Paid';
    // Optionally you could save paymentMethod and reference if your schema supported it
    
    await salesOrder.save();

    res.status(200).json({
        success: true,
        message: "Payment successful",
        data: salesOrder,
    });
});
