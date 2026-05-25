const RFQ = require("../../../models/RFQ");
const Quotation = require("../../../models/Quotation");
const PurchaseOrder = require("../../../models/PurchaseOrder");
const Payment = require("../../../models/Payment");
const PurchaseRequest = require("../models/PurchaseRequest");
const Delivery = require("../models/Delivery");
const Invoice = require("../models/Invoice");
const ProcurementPayment = require("../models/ProcurementPayment");
const ComparisonEngineService = require("./comparisonEngine.service");
const ProcurementSLAService = require("./sla.service");
const procurementEvents = require("../events/procurement.events");

const addHours = (date, hours) => new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);

class ProcurementWorkflowService {
  static emit(req, payload) {
    procurementEvents.emit("procurement.action", {
      req,
      tenantId: req.tenantId,
      actorId: req.user?._id,
      actorRole: req.user?.role,
      ...payload,
    });
  }

  static async createPurchaseRequest(req, payload) {
    const now = Date.now();
    const requestNo = `PR-${String(now).slice(-6)}-${String(req.user?._id || "").slice(-4)}`;
    const items = (payload.items || []).map((item) => {
      const quantity = Number(item.quantity || 0);
      const estimatedUnitPrice = Number(item.estimatedUnitPrice || 0);
      return {
        ...item,
        quantity,
        estimatedUnitPrice,
        estimatedTotal: quantity * estimatedUnitPrice,
      };
    });
    const totalEstimate = items.reduce((acc, item) => acc + Number(item.estimatedTotal || 0), 0);

    const pr = await PurchaseRequest.create({
      requestNo,
      title: payload.title,
      description: payload.description || "",
      departmentId: payload.departmentId || null,
      requesterId: req.user._id,
      tenantId: req.tenantId,
      currency: payload.currency || "INR",
      requiredBy: payload.requiredBy || null,
      items,
      totalEstimate,
      status: payload.submit ? "submitted" : "draft",
      approvalTrail: payload.submit
        ? [{ actorId: req.user._id, actorRole: req.user.role, action: "submitted", remarks: payload.remarks || "" }]
        : [],
      slaDueAt: payload.submit ? addHours(new Date(), 24) : null,
    });

    if (payload.submit) {
      await ProcurementSLAService.upsertSLA({
        tenantId: req.tenantId,
        entityType: "purchase_request",
        entityId: pr._id,
        stage: "approval",
        dueAt: pr.slaDueAt,
        assignedToRole: "procurement",
      });
    }

    this.emit(req, {
      actionType: payload.submit ? "PR_SUBMITTED" : "PR_CREATED",
      entityType: "PurchaseRequest",
      entityId: pr._id,
      afterData: pr.toObject(),
    });

    return pr;
  }

  static async approvePurchaseRequest(req, prId, { approve, remarks = "" }) {
    const pr = await PurchaseRequest.findOne({ _id: prId, tenantId: req.tenantId });
    if (!pr) throw new Error("Purchase request not found.");
    if (!["submitted", "draft"].includes(pr.status)) throw new Error(`Purchase request already ${pr.status}.`);

    const previous = pr.toObject();
    pr.status = approve ? "approved" : "rejected";
    pr.approvalTrail.push({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: approve ? "approved" : "rejected",
      remarks,
    });
    await pr.save();

    await ProcurementSLAService.markMet({
      tenantId: req.tenantId,
      entityType: "purchase_request",
      entityId: pr._id,
      stage: "approval",
    });

    this.emit(req, {
      actionType: approve ? "PR_APPROVED" : "PR_REJECTED",
      entityType: "PurchaseRequest",
      entityId: pr._id,
      beforeData: previous,
      afterData: pr.toObject(),
      metadata: { remarks },
    });

    return pr;
  }

  static async createRFQFromPR(req, prId, payload) {
    const pr = await PurchaseRequest.findOne({ _id: prId, tenantId: req.tenantId });
    if (!pr) throw new Error("Purchase request not found.");
    if (pr.status !== "approved") throw new Error("Only approved PR can be converted to RFQ.");
    if (pr.rfqId) throw new Error("RFQ already created for this PR.");

    const rfq = await RFQ.create({
      title: payload.title || pr.title,
      description: payload.description || pr.description || "Auto-generated RFQ from PR",
      departmentId: pr.departmentId || payload.departmentId || null,
      items: pr.items.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        unit: item.uom || "Nos",
        specifications: item.specs || "",
      })),
      budget: { amount: pr.totalEstimate, currency: pr.currency || "INR" },
      quoteDeadline: payload.quoteDeadline,
      deliveryDeadline: payload.deliveryDeadline || pr.requiredBy || null,
      vendorSelection: payload.vendorSelection || { type: "open", targetedVendors: [] },
      termsAndConditions: payload.termsAndConditions || "",
      status: payload.publish ? "published" : "draft",
      tenantId: req.tenantId,
      createdBy: req.user._id,
    });

    pr.rfqId = rfq._id;
    pr.status = "converted_to_rfq";
    await pr.save();

    await ProcurementSLAService.upsertSLA({
      tenantId: req.tenantId,
      entityType: "rfq",
      entityId: rfq._id,
      stage: "quotation_submission",
      dueAt: rfq.quoteDeadline,
      assignedToRole: "vendor",
    });

    this.emit(req, {
      actionType: "RFQ_CREATED_FROM_PR",
      entityType: "RFQ",
      entityId: rfq._id,
      metadata: { prId: pr._id },
      afterData: rfq.toObject(),
    });

    return { pr, rfq };
  }

  static async submitQuotation(req, payload) {
    const rfq = await RFQ.findOne({ _id: payload.rfqId, tenantId: req.tenantId });
    if (!rfq) throw new Error("RFQ not found.");
    if (rfq.status !== "published" && rfq.status !== "open") {
      throw new Error("RFQ is not open for quotations.");
    }

    const quotation = await Quotation.create({
      rfqId: rfq._id,
      vendorId: payload.vendorId,
      items: payload.items || [],
      totalAmount: payload.totalAmount,
      validUntil: payload.validUntil,
      status: "submitted",
      tenantId: req.tenantId,
      submittedBy: req.user._id,
    });

    this.emit(req, {
      actionType: "QUOTATION_SUBMITTED",
      entityType: "Quotation",
      entityId: quotation._id,
      metadata: { rfqId: rfq._id, vendorId: quotation.vendorId },
      afterData: quotation.toObject(),
    });

    return quotation;
  }

  static async compareQuotations(req, rfqId) {
    return ComparisonEngineService.buildComparisonMatrix({ rfqId, tenantId: req.tenantId });
  }

  static async selectVendor(req, quotationId) {
    const quotation = await Quotation.findOne({ _id: quotationId, tenantId: req.tenantId });
    if (!quotation) throw new Error("Quotation not found.");
    if (quotation.status === "accepted") throw new Error("Quotation already accepted.");

    const rfq = await RFQ.findOne({ _id: quotation.rfqId, tenantId: req.tenantId });
    if (!rfq) throw new Error("RFQ not found.");

    quotation.status = "accepted";
    await quotation.save();
    await Quotation.updateMany(
      { tenantId: req.tenantId, rfqId: quotation.rfqId, _id: { $ne: quotation._id } },
      { $set: { status: "rejected" } }
    );

    rfq.status = "closed";
    await rfq.save();

    const poNumber = `PO-${Date.now().toString().slice(-6)}-${String(rfq._id).slice(-4)}`;
    const po = await PurchaseOrder.create({
      poNumber,
      rfqId: rfq._id,
      vendorId: quotation.vendorId,
      quotationId: quotation._id,
      items: (quotation.items || []).map((item) => ({
        name: item.notes || "Item",
        quantity: 1,
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.totalPrice || item.unitPrice || 0),
      })),
      totalAmount: quotation.totalAmount,
      status: "draft", // Initially draft, becomes 'sent' or 'paid' after payment
      tenantId: req.tenantId,
      createdBy: req.user._id,
    });

    // Auto-create a Proforma Invoice for advance payment
    const invoiceNumber = `INV-ADV-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
      invoiceNumber,
      poId: po._id,
      vendorId: quotation.vendorId,
      tenantId: req.tenantId,
      invoiceDate: new Date(),
      dueDate: addHours(new Date(), 48),
      currency: quotation.currency || "INR",
      baseAmount: quotation.totalAmount,
      totalAmount: quotation.totalAmount,
      status: "approved", // Pre-approved for admin payment
      lines: (quotation.items || []).map(it => ({
        itemName: it.notes || "Advance Payment",
        quantity: 1,
        unitPrice: it.unitPrice || quotation.totalAmount,
        lineTotal: it.totalPrice || quotation.totalAmount
      }))
    });

    await ProcurementSLAService.markMet({
      tenantId: req.tenantId,
      entityType: "rfq",
      entityId: rfq._id,
      stage: "quotation_submission",
    });

    await ProcurementSLAService.upsertSLA({
      tenantId: req.tenantId,
      entityType: "purchase_order",
      entityId: po._id,
      stage: "delivery",
      dueAt: rfq.deliveryDeadline || addHours(new Date(), 72),
      assignedToRole: "vendor",
    });

    this.emit(req, {
      actionType: "VENDOR_SELECTED_PO_CREATED",
      entityType: "PurchaseOrder",
      entityId: po._id,
      metadata: { rfqId: rfq._id, quotationId: quotation._id },
      afterData: po.toObject(),
    });

    return { quotation, rfq, po };
  }

  static async upsertDelivery(req, payload) {
    const po = await PurchaseOrder.findOne({ _id: payload.poId, tenantId: req.tenantId });
    if (!po) throw new Error("Purchase order not found.");

    const deliveryNumber = payload.deliveryNumber || `DLV-${Date.now().toString().slice(-6)}-${String(po._id).slice(-4)}`;
    const record = await Delivery.findOneAndUpdate(
      { tenantId: req.tenantId, poId: po._id, deliveryNumber },
      {
        deliveryNumber,
        poId: po._id,
        vendorId: po.vendorId,
        tenantId: req.tenantId,
        expectedDate: payload.expectedDate || po.deliveryTracking?.estimatedDelivery || null,
        deliveredDate: payload.deliveredDate || null,
        status: payload.status || "in_transit",
        tracking: payload.tracking || {},
        items: payload.items || [],
        proofDocuments: payload.proofDocuments || [],
        receivedBy: payload.receivedBy || null,
        remarks: payload.remarks || "",
      },
      { upsert: true, new: true, runValidators: true }
    );

    po.deliveryTracking = {
      ...(po.deliveryTracking || {}),
      carrier: payload.tracking?.carrier || po.deliveryTracking?.carrier || "",
      trackingNumber: payload.tracking?.trackingNumber || po.deliveryTracking?.trackingNumber || "",
      estimatedDelivery: payload.expectedDate || po.deliveryTracking?.estimatedDelivery || null,
      actualDelivery: payload.deliveredDate || null,
      status: payload.status || "in_transit",
    };

    if (["delivered", "partial"].includes(payload.status)) {
      po.status = payload.status === "delivered" ? "delivered" : po.status;
    }
    await po.save();

    if (payload.status === "delivered") {
      await ProcurementSLAService.markMet({
        tenantId: req.tenantId,
        entityType: "purchase_order",
        entityId: po._id,
        stage: "delivery",
      });
    }

    this.emit(req, {
      actionType: "DELIVERY_UPDATED",
      entityType: "Delivery",
      entityId: record._id,
      metadata: { poId: po._id, status: record.status },
      afterData: record.toObject(),
    });

    return { delivery: record, po };
  }

  static async createInvoice(req, payload) {
    const po = await PurchaseOrder.findOne({ _id: payload.poId, tenantId: req.tenantId });
    if (!po) throw new Error("Purchase order not found.");

    const lines = (payload.lines || []).map((line) => ({
      itemName: line.itemName,
      quantity: Number(line.quantity || 0),
      unitPrice: Number(line.unitPrice || 0),
      lineTotal: Number(line.quantity || 0) * Number(line.unitPrice || 0),
    }));
    const baseAmount = lines.reduce((acc, line) => acc + line.lineTotal, 0);
    const taxAmount = Number(payload.taxAmount || 0);
    const totalAmount = baseAmount + taxAmount;

    const invoice = await Invoice.create({
      invoiceNumber: payload.invoiceNumber,
      poId: po._id,
      vendorId: po.vendorId,
      tenantId: req.tenantId,
      invoiceDate: payload.invoiceDate || new Date(),
      dueDate: payload.dueDate || addHours(new Date(), 30 * 24), // default: 30 days from now
      currency: payload.currency || "INR",
      lines,
      baseAmount,
      taxAmount,
      totalAmount,
      status: payload.status || "submitted",
      attachments: payload.attachments || [],
      slaDueAt: addHours(new Date(), 48),
    });

    await ProcurementSLAService.upsertSLA({
      tenantId: req.tenantId,
      entityType: "invoice",
      entityId: invoice._id,
      stage: "verification",
      dueAt: invoice.slaDueAt,
      assignedToRole: "finance",
    });

    this.emit(req, {
      actionType: "INVOICE_SUBMITTED",
      entityType: "Invoice",
      entityId: invoice._id,
      metadata: { poId: po._id },
      afterData: invoice.toObject(),
    });

    return invoice;
  }

  static async reviewInvoice(req, invoiceId, { approve, reason = "" }) {
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: req.tenantId });
    if (!invoice) throw new Error("Invoice not found.");
    if (!["submitted", "verified"].includes(invoice.status)) throw new Error(`Invoice already ${invoice.status}.`);

    const previous = invoice.toObject();
    invoice.status = approve ? "approved" : "rejected";
    invoice.rejectionReason = reason;
    invoice.reviewedBy = req.user._id;
    invoice.reviewedAt = new Date();
    await invoice.save();

    await ProcurementSLAService.markMet({
      tenantId: req.tenantId,
      entityType: "invoice",
      entityId: invoice._id,
      stage: "verification",
    });

    this.emit(req, {
      actionType: approve ? "INVOICE_APPROVED" : "INVOICE_REJECTED",
      entityType: "Invoice",
      entityId: invoice._id,
      beforeData: previous,
      afterData: invoice.toObject(),
      metadata: { reason },
    });

    return invoice;
  }

  static async processPayment(req, invoiceId, { amount, method, transactionRef = "", reference = "", paymentDate }) {
    const finalTransactionRef = transactionRef || reference || "";
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: req.tenantId });
    if (!invoice) throw new Error("Invoice not found.");
    const canPay = invoice.status === "approved" || (invoice.status === "submitted" && String(invoice.invoiceNumber).startsWith("INV-AUTO-"));
    if (!canPay) throw new Error("Only approved invoice can be paid.");

    const po = await PurchaseOrder.findOne({ _id: invoice.poId, tenantId: req.tenantId });
    if (!po) throw new Error("Purchase order not found for invoice.");

    const paymentRef = `PAY-${Date.now().toString().slice(-6)}-${String(invoice._id).slice(-4)}`;

    const procurementPayment = await ProcurementPayment.create({
      paymentRef,
      invoiceId: invoice._id,
      poId: po._id,
      vendorId: invoice.vendorId,
      tenantId: req.tenantId,
      amount: Number(amount || invoice.totalAmount),
      method,
      status: "completed",
      transactionRef: finalTransactionRef,
      processedBy: req.user._id,
      processedAt: paymentDate ? new Date(paymentDate) : new Date(),
    });

    const paymentMethodMap = {
      bank_transfer: "bank_transfer",
      neft: "bank_transfer",
      rtgs: "bank_transfer",
      imps: "bank_transfer",
      upi: "bank_transfer",
      card: "card",
      cheque: "check",
      other: "check",
    };

    await Payment.create({
      poId: po._id,
      amount: procurementPayment.amount,
      method: paymentMethodMap[method] || "bank_transfer",
      transactionRef: finalTransactionRef,
      status: "completed",
      tenantId: req.tenantId,
    });

    invoice.status = "paid";
    await invoice.save();
    po.status = "paid";
    await po.save();

    this.emit(req, {
      actionType: "PAYMENT_COMPLETED",
      entityType: "ProcurementPayment",
      entityId: procurementPayment._id,
      metadata: { invoiceId: invoice._id, poId: po._id },
      afterData: procurementPayment.toObject(),
    });

    return { invoice, po, payment: procurementPayment };
  }
}

module.exports = ProcurementWorkflowService;
