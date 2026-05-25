const PurchaseOrder = require("../../../models/PurchaseOrder");
const Invoice = require("../models/Invoice");
const ProcurementPayment = require("../models/ProcurementPayment");
const asyncHandler = require("../../../utils/asyncHandler");
const AppError = require("../../../utils/AppError");

const getVendorId = async (req) => {
    // Match vendor by email and tenantId (as defined in auth/registration flow)
    const Vendor = require("../../../models/vendor.model");
    const vendor = await Vendor.findOne({ 
        email: req.user.email, 
        tenantId: req.user.tenantId 
    });
    if (!vendor) throw new AppError("Vendor profile not found", 404);
    return vendor._id;
};

exports.acceptPO = asyncHandler(async (req, res, next) => {
    const vendorId = await getVendorId(req);
    const po = await PurchaseOrder.findOne({ _id: req.params.id, vendorId });
    
    if (!po) return next(new AppError("Purchase Order not found or unauthorized", 404));
    if (po.status !== "sent") return next(new AppError(`Cannot accept PO in ${po.status} status`, 400));

    po.status = "accepted";
    po.acceptedAt = new Date();
    await po.save();

    res.status(200).json({ success: true, data: po });
});

exports.rejectPO = asyncHandler(async (req, res, next) => {
    const vendorId = await getVendorId(req);
    const { reason } = req.body;
    if (!reason) return next(new AppError("Rejection reason is required", 400));

    const po = await PurchaseOrder.findOne({ _id: req.params.id, vendorId });
    
    if (!po) return next(new AppError("Purchase Order not found or unauthorized", 404));
    if (po.status !== "sent") return next(new AppError(`Cannot reject PO in ${po.status} status`, 400));

    po.status = "rejected";
    po.rejectedAt = new Date();
    po.rejectionReason = reason;
    await po.save();

    res.status(200).json({ success: true, data: po });
});

exports.getVendorPayments = asyncHandler(async (req, res) => {
    const vendorId = await getVendorId(req);
    const payments = await ProcurementPayment.find({ vendorId })
        .populate("invoiceId", "invoiceNumber totalAmount status")
        .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: payments });
});

exports.getVendorStatement = asyncHandler(async (req, res) => {
    const vendorId = await getVendorId(req);
    
    const [invoices, payments] = await Promise.all([
        Invoice.find({ vendorId, status: { $ne: "rejected" } }),
        ProcurementPayment.find({ vendorId, status: "completed" })
    ]);

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalBilled - totalPaid;

    res.status(200).json({
        success: true,
        data: {
            totalBilled,
            totalPaid,
            balance,
            invoiceCount: invoices.length,
            paymentCount: payments.length
        }
    });
});
