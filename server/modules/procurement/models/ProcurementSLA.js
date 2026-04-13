const mongoose = require("mongoose");

const procurementSLASchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    entityType: {
      type: String,
      enum: ["purchase_request", "rfq", "quotation", "purchase_order", "delivery", "invoice", "payment"],
      required: true,
      index: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    stage: { type: String, required: true },
    dueAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "met", "breached", "escalated"],
      default: "active",
      index: true,
    },
    breachedAt: { type: Date, default: null },
    escalatedAt: { type: Date, default: null },
    escalationLevel: { type: Number, default: 0 },
    assignedToRole: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

procurementSLASchema.index({ tenantId: 1, entityType: 1, entityId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("ProcurementSLA", procurementSLASchema);
