const mongoose = require("mongoose");
const validator = require("validator");

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vendor name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Vendor email is required"],
            lowercase: true,
            validate: [validator.isEmail, "Please provide a valid email address"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            validate: {
                validator: function (v) {
                    return /\d{10}/.test(v); // Simple 10-digit validation
                },
                message: "Please provide a valid 10-digit phone number",
            },
        },
        companyName: {
            type: String,
            trim: true,
        },
        gstNumber: {
            type: String,
            uppercase: true,
            validate: {
                validator: function (v) {
                    // GST Format: 2 digits, 10 alphanumeric (PAN), 1 entity digit, 1 char (Z), 1 check digit
                    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                        v
                    );
                },
                message: "Please provide a valid GST number format",
            },
        },
        address: {
            city: String,
            state: String,
            pincode: String,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        departments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Department",
            },
        ],
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false, // Don't return this field by default
        },
        // Performance tracking fields
        totalOrders: {
            type: Number,
            default: 0,
        },
        completedOrders: {
            type: Number,
            default: 0,
        },
        pendingPayments: {
            type: Number,
            default: 0,
        },
        onTimeDeliveries: {
            type: Number,
            default: 0,
        },
        gstCertificate: {
            public_id: String,
            url: String,
        },
        agreementFile: {
            public_id: String,
            url: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual field for On-Time Delivery Percentage
vendorSchema.virtual("onTimeDeliveryPercentage").get(function () {
    if (this.completedOrders === 0) return 0;
    return Math.round((this.onTimeDeliveries / this.completedOrders) * 100);
});

// Query middleware to exclude deleted vendors automatically
vendorSchema.pre(/^find/, async function () {
    this.find({ isDeleted: { $ne: true } });
});

module.exports = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
