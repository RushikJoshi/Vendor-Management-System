const mongoose = require("mongoose");

const treeFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "dropdown", "radio", "checkbox", "date", "file"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String, trim: true }],
    validation: {
      pattern: { type: String, default: "none" },
      min: { type: Number },
      max: { type: Number },
      minLength: { type: Number },
      maxLength: { type: Number },
      allowedFileTypes: [{ type: String }],
      maxFileSizeMB: { type: Number, default: 5 },
    },
  },
  { _id: false }
);

const treeNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    children: [],
    fields: { type: [treeFieldSchema], default: [] },
  },
  { _id: false }
);

treeNodeSchema.add({
  children: { type: [treeNodeSchema], default: [] },
});

const treeFormSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    categoryName: { type: String, trim: true, default: "" },
    version: { type: Number, default: 1 },
    structure: { type: [treeNodeSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TreeForm", treeFormSchema);
