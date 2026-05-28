const SalesOrder = require("../models/SalesOrder");
const Client = require("../models/Client");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const SequenceService = require("../services/SequenceService");
const { normalizeRole } = require("../config/roles");

const ORDER_STATUSES = ["Draft", "Sent", "Accepted", "Invoiced", "Paid", "Cancelled"];
const CLIENT_VISIBLE_STATUSES = ["Draft", "Sent", "Accepted", "Invoiced", "Paid", "Cancelled"];

// Mock PDF Generator for Sales Order
const generateSalesOrderPDF = async (soData) => {
    // In a real scenario, use PDFKit similar to pdfGenerator.js
    return `/uploads/so/${soData.soNumber}.pdf`;
};

// @desc    Create new Sales Order
// @route   POST /api/sales-orders
// @access  Private
exports.createSalesOrder = asyncHandler(async (req, res, next) => {
    if (!req.user?.tenantId) {
        return next(new AppError("Tenant context missing.", 400));
    }

    const { clientId, deliveryAddress = "", expectedDeliveryDate = null, notes = "" } = req.body;
    const client = await Client.findOne({ _id: clientId, tenantId: req.user.tenantId });
    if (!client) {
        return next(new AppError("Client not found for this tenant.", 404));
    }

    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return next(new AppError("At least one sales order item is required.", 400));
    }

    const items = req.body.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!item.name || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
            throw new AppError("Each item requires name, positive quantity and valid unit price.", 400);
        }
        return {
            name: String(item.name).trim(),
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice,
            hsn: item.hsn || "",
        };
    });

    const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const soNumber = await SequenceService.getNextSequence(req.user.tenantId, "so");

    let salesOrder = await SalesOrder.create({
        soNumber,
        clientId: client._id,
        items,
        totalAmount,
        deliveryAddress,
        expectedDeliveryDate,
        notes,
        status: "Draft",
        tenantId: req.user.tenantId,
        createdBy: req.user._id,
        statusHistory: [{
            from: null,
            to: "Draft",
            changedBy: req.user._id,
            remarks: "Sales order created",
        }],
    });

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
    if (normalizeRole(req.user.role) === 'client') {
        if (!req.user.clientId) return next(new AppError("Client profile missing for this login.", 403));
        filter.clientId = req.user.clientId;
        filter.status = { $in: CLIENT_VISIBLE_STATUSES };
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
    if (normalizeRole(req.user.role) === 'client') {
        if (!req.user.clientId) return next(new AppError("Client profile missing for this login.", 403));
        filter.clientId = req.user.clientId;
        filter.status = { $in: CLIENT_VISIBLE_STATUSES };
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
    const { status, remarks = "" } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
        return next(new AppError("Unsupported sales order status.", 400));
    }

    let salesOrder = await SalesOrder.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId
    });

    if (!salesOrder) {
        return next(new AppError("Sales Order not found", 404));
    }

    const previousStatus = salesOrder.status;
    salesOrder.status = status;
    salesOrder.statusHistory.push({
        from: previousStatus,
        to: status,
        changedBy: req.user._id,
        remarks,
    });
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
    if (!req.user.clientId) {
        return next(new AppError("Client profile missing for this login.", 403));
    }
    
    let salesOrder = await SalesOrder.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId,
        clientId: req.user.clientId,
    });

    if (!salesOrder) {
        return next(new AppError("Sales Order not found", 404));
    }
    
    if (salesOrder.status === 'Paid') {
        return next(new AppError("Order is already paid", 400));
    }
    if (!["Draft", "Sent", "Accepted", "Invoiced"].includes(salesOrder.status)) {
        return next(new AppError("Only draft, sent, accepted or invoiced sales orders can be paid.", 400));
    }
    if (!paymentMethod) {
        return next(new AppError("Payment method is required.", 400));
    }

    const paidAmount = Number(amount || salesOrder.totalAmount);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
        return next(new AppError("Valid payment amount is required.", 400));
    }
    if (paidAmount !== salesOrder.totalAmount) {
        return next(new AppError("Payment amount must match the sales order total.", 400));
    }

    const previousStatus = salesOrder.status;

    // Update status to Paid and save payment metadata
    salesOrder.status = 'Paid';
    salesOrder.payment = {
        method: paymentMethod,
        reference,
        amount: paidAmount,
        paidAt: new Date(),
        paidBy: req.user._id,
    };
    salesOrder.statusHistory.push({
        from: previousStatus,
        to: "Paid",
        changedBy: req.user._id,
        remarks: reference ? `Payment reference: ${reference}` : "Client payment completed",
    });
    
    await salesOrder.save();

    res.status(200).json({
        success: true,
        message: "Payment successful",
        data: salesOrder,
    });
});
