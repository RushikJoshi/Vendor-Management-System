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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    vendorEmail: { type: String, default: "" },
    vendorName: { type: String, default: "" },
    vendorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

treeSubmissionSchema.index({ formId: 1, status: 1 });
treeSubmissionSchema.index({ vendorEmail: 1 });

module.exports = mongoose.model("TreeSubmission", treeSubmissionSchema);
