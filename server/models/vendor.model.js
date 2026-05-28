const mongoose = require("mongoose");
const validator = require("validator");

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vendor name is required"],
            trim: true,
        },
        vendorId: {
            type: String,
            unique: true,
            sparse: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
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
                    return /^\d{10,12}$/.test(v.replace(/\s+/g, '')); // Allow 10 to 12 digits, ignore spaces
                },
                message: "Please provide a valid phone number (10-12 digits)",
            },
        },
        companyName: {
            type: String,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        serviceType: {
            type: String,
            trim: true,
            default: "General",
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
        lifecycleStatus: {
            type: String,
            enum: ["active", "inactive", "suspended", "blacklisted"],
            default: "active",
        },
        blacklistHistory: [
            {
                reason: String,
                remarks: String,
                blacklistedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                blacklistedAt: { type: Date, default: Date.now }
            }
        ],
        createdFromApplicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VendorApplication"
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
        bankAccount: {
            accountHolderName: String,
            accountNumber: String,
            bankName: String,
            ifscCode: String,
            branchName: String,
        },
        companyDetails: {
            website: String,
            establishmentYear: Number,
            natureOfBusiness: String,
            employeeCount: Number,
            registeredAddress: String,
        },
        contactDetails: {
            name: String,
            designation: String,
            mobile: String,
            email: String,
            alternateContact: String,
        },
        statutoryDetails: {
            panNumber: String,
            gstNumber: String,
            registrationType: String,
            msmeNumber: String,
            msmeCategory: String,
        },
        taxDetails: {
            itrLast3Years: String,
            taxResidencyCert: String,
            vatNumber: String,
        },
        complianceDetails: {
            antiBribery: Boolean,
            noConflict: Boolean,
            dataPrivacy: Boolean,
        },
        documents: [
            {
                name: String,
                url: String,
                public_id: String,
                fieldName: String,
                status: {
                    type: String,
                    enum: ["pending", "verified", "rejected"],
                    default: "pending",
                },
            },
        ],
        contractsCount: {
            type: Number,
            default: 0,
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

vendorSchema.index({ tenantId: 1, email: 1 });
vendorSchema.index({ tenantId: 1, status: 1 });
vendorSchema.index({ tenantId: 1, category: 1, lifecycleStatus: 1 });

module.exports = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
