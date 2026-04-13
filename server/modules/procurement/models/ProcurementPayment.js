const mongoose = require("mongoose");

const procurementPaymentSchema = new mongoose.Schema(
  {
    paymentRef: { type: String, required: true, trim: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    poId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["bank_transfer", "neft", "rtgs", "upi", "card", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "processing", "completed", "failed"],
      default: "initiated",
      index: true,
    },
    transactionRef: { type: String, default: "" },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true }
);

procurementPaymentSchema.index({ tenantId: 1, paymentRef: 1 }, { unique: true });

module.exports = mongoose.model("ProcurementPayment", procurementPaymentSchema);
