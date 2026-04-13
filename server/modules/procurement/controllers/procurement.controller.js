const PurchaseRequest = require("../models/PurchaseRequest");
const Delivery = require("../models/Delivery");
const Invoice = require("../models/Invoice");
const ProcurementPayment = require("../models/ProcurementPayment");
const ProcurementSLA = require("../models/ProcurementSLA");
const RFQ = require("../../../models/RFQ");
const Quotation = require("../../../models/Quotation");
const PurchaseOrder = require("../../../models/PurchaseOrder");
const ProcurementWorkflowService = require("../services/procurementWorkflow.service");
const asyncHandler = require("../../../utils/asyncHandler");
const AppError = require("../../../utils/AppError");

const tenantFilter = (req, extra = {}) => ({ tenantId: req.tenantId || req.user?.tenantId, ...extra });

exports.getOverview = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [prPending, openRfqs, quotations, openPOs, inTransitDeliveries, pendingInvoices, pendingPayments, breachedSLAs] =
    await Promise.all([
      PurchaseRequest.countDocuments({ ...filter, status: { $in: ["submitted"] } }),
      RFQ.countDocuments({ ...filter, status: { $in: ["draft", "published"] } }),
      Quotation.countDocuments(filter),
      PurchaseOrder.countDocuments({ ...filter, status: { $in: ["sent", "accepted", "delivered"] } }),
      Delivery.countDocuments({ ...filter, status: { $in: ["pending", "in_transit", "partial"] } }),
      Invoice.countDocuments({ ...filter, status: { $in: ["submitted", "verified", "approved"] } }),
      ProcurementPayment.countDocuments({ ...filter, status: { $in: ["initiated", "processing"] } }),
      ProcurementSLA.countDocuments({ ...filter, status: { $in: ["breached", "escalated"] } }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      prPending,
      openRfqs,
      quotations,
      openPOs,
      inTransitDeliveries,
      pendingInvoices,
      pendingPayments,
      breachedSLAs,
    },
  });
});

exports.listPurchaseRequests = asyncHandler(async (req, res) => {
  const status = req.query.status ? { status: req.query.status } : {};
  const rows = await PurchaseRequest.find(tenantFilter(req, status))
    .populate("requesterId", "name email role")
    .populate("departmentId", "name")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rows });
});

exports.createPurchaseRequest = asyncHandler(async (req, res, next) => {
  const payload = req.body || {};
  if (!payload.title || !Array.isArray(payload.items) || payload.items.length === 0) {
    return next(new AppError("title and items are required", 400));
  }
  const pr = await ProcurementWorkflowService.createPurchaseRequest(req, payload);
  res.status(201).json({ success: true, data: pr });
});

exports.approvePurchaseRequest = asyncHandler(async (req, res) => {
  const pr = await ProcurementWorkflowService.approvePurchaseRequest(req, req.params.id, {
    approve: req.body.approve === true,
    remarks: req.body.remarks || "",
  });
  res.status(200).json({ success: true, data: pr });
});

exports.createRfqFromPr = asyncHandler(async (req, res) => {
  const result = await ProcurementWorkflowService.createRFQFromPR(req, req.params.id, req.body || {});
  res.status(201).json({ success: true, data: result });
});

exports.getQuotationComparison = asyncHandler(async (req, res) => {
  const matrix = await ProcurementWorkflowService.compareQuotations(req, req.params.rfqId);
  res.status(200).json({ success: true, data: matrix });
});

exports.selectVendor = asyncHandler(async (req, res) => {
  const result = await ProcurementWorkflowService.selectVendor(req, req.params.quotationId);
  res.status(200).json({ success: true, data: result });
});

exports.listPurchaseOrders = asyncHandler(async (req, res) => {
  const rows = await PurchaseOrder.find(tenantFilter(req))
    .populate("vendorId", "name companyName email phone address bankAccount")
    .populate("rfqId", "title")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rows });
});

exports.upsertDelivery = asyncHandler(async (req, res) => {
  const result = await ProcurementWorkflowService.upsertDelivery(req, req.body || {});
  res.status(200).json({ success: true, data: result });
});

exports.listDeliveries = asyncHandler(async (req, res) => {
  const rows = await Delivery.find(tenantFilter(req))
    .populate("poId", "poNumber status")
    .populate("vendorId", "name companyName")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rows });
});

exports.createInvoice = asyncHandler(async (req, res) => {
  const invoice = await ProcurementWorkflowService.createInvoice(req, req.body || {});
  res.status(201).json({ success: true, data: invoice });
});

exports.reviewInvoice = asyncHandler(async (req, res) => {
  const invoice = await ProcurementWorkflowService.reviewInvoice(req, req.params.invoiceId, {
    approve: req.body.approve === true,
    reason: req.body.reason || "",
  });
  res.status(200).json({ success: true, data: invoice });
});

exports.listInvoices = asyncHandler(async (req, res) => {
  const rows = await Invoice.find(tenantFilter(req))
    .populate("poId", "poNumber")
    .populate("vendorId", "name companyName bankAccount")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rows });
});

exports.processPayment = asyncHandler(async (req, res) => {
  const result = await ProcurementWorkflowService.processPayment(req, req.params.invoiceId, req.body || {});
  res.status(200).json({ success: true, data: result });
});

exports.listPayments = asyncHandler(async (req, res) => {
  const rows = await ProcurementPayment.find(tenantFilter(req))
    .populate("invoiceId", "invoiceNumber totalAmount")
    .populate("vendorId", "name companyName bankAccount")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rows });
});

exports.listSlaBreaches = asyncHandler(async (req, res) => {
  const rows = await ProcurementSLA.find(tenantFilter(req, { status: { $in: ["breached", "escalated"] } })).sort({
    dueAt: 1,
  });
  res.status(200).json({ success: true, data: rows });
});
