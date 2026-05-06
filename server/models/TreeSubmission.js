const mongoose = require("mongoose");

const submissionValueSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    nodePath: { type: String, default: "" },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  { _id: false }
);

const treeSubmissionSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "TreeForm", required: true },
    formName: { type: String, required: true },
    categoryName: { type: String, default: "" },
    data: { type: [submissionValueSchema], default: [] },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "needs_correction",
        "on_hold",
        "escalated",
        "conditionally_approved",
      ],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    decisionReason: { type: String, default: "" },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    riskScore: { type: Number, min: 0, max: 100, default: 50 },
    correctionCount: { type: Number, default: 0 },
    decisionHistory: {
      type: [
        {
          action: {
            type: String,
            enum: ["approve", "reject", "send_back", "hold", "escalate", "conditional_approve"],
            required: true,
          },
          fromStatus: { type: String, required: true },
          toStatus: { type: String, required: true },
          reason: { type: String, default: "" },
          reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reviewerRole: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    vendorEmail: { type: String, default: "" },
    vendorName: { type: String, default: "" },
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

treeSubmissionSchema.index({ formId: 1, status: 1 });
treeSubmissionSchema.index({ category: 1 });
treeSubmissionSchema.index({ vendorEmail: 1 });

module.exports = mongoose.model("TreeSubmission", treeSubmissionSchema);
