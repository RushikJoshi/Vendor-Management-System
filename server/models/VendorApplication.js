const mongoose = require("mongoose");

const vendorApplicationSchema = new mongoose.Schema(
    {
        formTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormTemplate",
            required: true,
        },
        formVersion: {
            type: Number,
            default: 1
        },
        applicationId: {
            type: String,
            unique: true,
            sparse: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        invitationToken: {
            type: String,
            index: true
        },
        currentStage: {
            type: String,
            enum: ["TECHNICAL", "FINANCE", "COMPLIANCE", "FINAL_APPROVAL", "COMPLETED"],
            default: "TECHNICAL"
        },
        eligibilityScore: {
            type: Number,
            default: 0
        },
        eligibilityStatus: {
            type: String,
            enum: ["ELIGIBLE", "PARTIALLY_ELIGIBLE", "NOT_ELIGIBLE"],
            default: "NOT_ELIGIBLE"
        },
        riskLevel: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "High"
        },
        scoreBreakdown: {
            turnover: { type: Number, default: 0 },
            experience: { type: Number, default: 0 },
            certification: { type: Number, default: 0 },
            documents: { type: Number, default: 0 }
        },
        data: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        },
        email: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: true,
        },
        pdfPath: String,
        vendorEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        status: {
            type: String,
            enum: ["draft", "submitted", "in_review", "approved", "rejected", "changes_requested"],
            default: "draft",
        },
        approvedAt: Date,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        rejectedAt: Date,
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        approvalHistory: [
            {
                stage: String,
                approver: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin",
                },
                status: {
                    type: String,
                    enum: ["approved", "rejected", "changes_requested"],
                },
                remarks: String,
                actionDate: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        workflowStages: [
            {
                stageOrder: Number,
                stageName: String,
                assignedRole: String,
                status: {
                    type: String,
                    enum: ["locked", "pending", "approved", "rejected"],
                    default: "locked"
                },
                reviewedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin"
                },
                reviewedAt: Date,
                remarks: String
            }
        ],
        documents: [
            {
                name: String,
                url: String,
                public_id: String,
                fieldName: String,
                status: {
                    type: String,
                    enum: ["pending", "verified", "rejected"],
                    default: "pending"
                },
                expiryDate: Date,
                rejectionReason: String,
                reminderSent: { type: Boolean, default: false }
            },
        ],
        submittedAt: Date,
        approvedAt: Date,
        lastReminderSentAt: Date,
    },
    { timestamps: true }
);

// Indexes for Performance
vendorApplicationSchema.index({ riskLevel: 1 });
vendorApplicationSchema.index({ category: 1 });
vendorApplicationSchema.index({ status: 1 });
vendorApplicationSchema.index({ "documents.expiryDate": 1 });
vendorApplicationSchema.index({ "workflowStages.stageOrder": 1 });

// Pre-save self-heal: ensure currentStage is always a valid enum value
const VALID_STAGES = ["TECHNICAL", "FINANCE", "COMPLIANCE", "FINAL_APPROVAL", "COMPLETED"];
vendorApplicationSchema.pre("save", async function () {
    if (!VALID_STAGES.includes(this.currentStage)) {
        this.currentStage = "TECHNICAL";
    }
});

module.exports = mongoose.model("VendorApplication", vendorApplicationSchema);
