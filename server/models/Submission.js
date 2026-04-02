const mongoose = require("mongoose");

const submissionResponseSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "dropdown", "multiselect", "date", "file"],
      required: true,
    },
    section: { type: String, default: "General Information" },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    formName: { type: String, required: true },
    categoryName: { type: String, required: true },
    vendorName: { type: String, trim: true, default: "" },
    vendorEmail: { type: String, trim: true, lowercase: true, default: "" },
    responses: { type: [submissionResponseSchema], default: [] },
    formSnapshot: {
      sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
      fields: { type: [mongoose.Schema.Types.Mixed], default: [] },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    vendorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

submissionSchema.index({ form: 1, status: 1 });
submissionSchema.index({ vendorEmail: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
