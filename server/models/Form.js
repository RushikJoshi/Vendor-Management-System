const mongoose = require("mongoose");

const formFieldSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "dropdown", "multiselect", "date", "file"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [{ type: String, trim: true }],
    placeholder: { type: String, trim: true },
    section: { type: String, trim: true, default: "General Information" },
    validation: {
      pattern: {
        type: String,
        enum: ["none", "pan", "gst"],
        default: "none",
      },
      min: { type: Number },
      max: { type: Number },
      allowedFileTypes: [{ type: String }],
      maxFileSizeMB: { type: Number, default: 5 },
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    categoryName: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    publicSlug: { type: String, required: true, unique: true, trim: true },
    sections: { type: [sectionSchema], default: [] },
    fields: { type: [formFieldSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
