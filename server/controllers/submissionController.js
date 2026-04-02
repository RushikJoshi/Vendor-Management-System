const crypto = require("crypto");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Vendor = require("../models/vendor.model");

const generatePassword = () => {
  const raw = crypto.randomBytes(6).toString("base64").replace(/[^a-zA-Z0-9]/g, "");
  return `${raw.slice(0, 10)}A1!`;
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("form", "name")
      .populate("vendorUser", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate("form", "name sections fields")
      .populate("vendorUser", "name email role")
      .populate("reviewedBy", "name email");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason = "" } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either approve or reject.",
      });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Submission already ${submission.status}.`,
      });
    }

    if (action === "reject") {
      submission.status = "rejected";
      submission.rejectionReason = rejectionReason || "Rejected by admin";
      submission.reviewedBy = req.user?._id;
      submission.reviewedAt = new Date();
      await submission.save();
      return res.status(200).json({
        success: true,
        message: "Submission rejected.",
        data: submission,
      });
    }

    if (!submission.vendorEmail) {
      return res.status(400).json({
        success: false,
        message: "No email found in submission. Add an email field before approval.",
      });
    }

    let user = await User.findOne({ email: submission.vendorEmail });
    let generatedPassword = null;

    if (!user) {
      generatedPassword = generatePassword();
      user = await User.create({
        name: submission.vendorName || "Vendor User",
        email: submission.vendorEmail,
        password: generatedPassword,
        role: "vendor",
        status: "active",
      });
    }

    submission.status = "approved";
    submission.vendorUser = user._id;
    submission.reviewedBy = req.user?._id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Create Vendor Registry Entry
    const phoneResponse = submission.responses?.find(r => 
      r.label?.toLowerCase().includes("phone") || 
      r.label?.toLowerCase().includes("mobile") || 
      r.label?.toLowerCase().includes("contact")
    );
    const phone = phoneResponse?.value || "0000000000";

    await Vendor.findOneAndUpdate(
      { email: submission.vendorEmail, tenantId: req.user.tenantId },
      {
        name: submission.vendorName || user.name,
        email: submission.vendorEmail,
        phone: String(phone).replace(/[^0-9]/g, "").slice(0, 10) || "0000000000",
        companyName: submission.vendorName || "New Vendor",
        tenantId: req.user.tenantId,
        createdBy: req.user._id,
        status: "active"
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Submission approved and vendor account created.",
      data: {
        submissionId: submission._id,
        status: submission.status,
        vendorUser: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        credentials: {
          email: user.email,
          password: generatedPassword,
          note: generatedPassword
            ? "Mock email: share these credentials with vendor."
            : "User already existed. Password unchanged.",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorDashboard = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    const submission = await Submission.findOne({
      $or: [{ vendorUser: userId }, { vendorEmail: userEmail }],
      status: "approved",
    }).sort({ reviewedAt: -1 });

    const profile = submission
      ? {
          vendorName: submission.vendorName,
          vendorEmail: submission.vendorEmail,
          categoryName: submission.categoryName,
          approvedAt: submission.reviewedAt,
        }
      : {
          vendorName: req.user?.name || "Vendor User",
          vendorEmail: userEmail,
          categoryName: "General Vendors",
          approvedAt: null,
        };

    const purchaseOrders = [
      {
        poNumber: "PO-2026-001",
        title: "Initial Procurement Batch",
        status: "Assigned",
        amount: 125000,
      },
      {
        poNumber: "PO-2026-002",
        title: "Monthly Service Retainer",
        status: "In Progress",
        amount: 45000,
      },
    ];

    return res.status(200).json({
      success: true,
      data: { profile, purchaseOrders },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
