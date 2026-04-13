const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    orderedQty: { type: Number, required: true, min: 0 },
    receivedQty: { type: Number, required: true, min: 0, default: 0 },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: { type: String, required: true, trim: true },
    poId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    expectedDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "in_transit", "partial", "delivered", "delayed"],
      default: "pending",
      index: true,
    },
    tracking: {
      carrier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
    },
    items: { type: [deliveryItemSchema], default: [] },
    proofDocuments: {
      type: [
        {
          name: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

deliverySchema.index({ tenantId: 1, deliveryNumber: 1 }, { unique: true });

module.exports = mongoose.model("Delivery", deliverySchema);
