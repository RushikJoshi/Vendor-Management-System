const mongoose = require("mongoose");

const purchaseRequestItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    uom: { type: String, default: "Nos", trim: true },
    estimatedUnitPrice: { type: Number, required: true, min: 0 },
    estimatedTotal: { type: Number, required: true, min: 0 },
    specs: { type: String, default: "" },
  },
  { _id: false }
);

const approvalEntrySchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, default: "" },
    action: { type: String, enum: ["submitted", "approved", "rejected"], required: true },
    remarks: { type: String, default: "" },
    actedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const purchaseRequestSchema = new mongoose.Schema(
  {
    requestNo: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    currency: { type: String, default: "INR" },
    requiredBy: { type: Date },
    items: { type: [purchaseRequestItemSchema], default: [] },
    totalEstimate: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "converted_to_rfq"],
      default: "draft",
      index: true,
    },
    approvalTrail: { type: [approvalEntrySchema], default: [] },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ", default: null },
    slaDueAt: { type: Date, default: null },
    slaBreachedAt: { type: Date, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

purchaseRequestSchema.index({ tenantId: 1, requestNo: 1 }, { unique: true });

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);
