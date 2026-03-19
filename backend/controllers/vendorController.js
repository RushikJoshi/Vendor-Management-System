const Vendor = require("../models/Vendor");
const Document = require("../models/Document");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");
const AuditService = require("../services/AuditService");

exports.getVendorMe = async (req, res) => {
  const vendor = await Vendor.findById(req.user.id);
  if (!vendor) {
    return res.status(404).json({ success: false, message: "Vendor not found" });
  }
  res.status(200).json({ success: true, data: vendor });
};

exports.updateVendorProfile = async (req, res) => {
  // Prevent updating restricted fields
  const { status, role, email, password, ...updateData } = req.body;

  const vendor = await Vendor.findById(req.user.id);
  if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

  const beforeData = vendor.toObject();
  vendor.set(updateData);
  await vendor.save();

  await AuditService.logUpdate(req, "Vendor", req.user.id, beforeData, vendor.toObject());

  res.status(200).json({ success: true, data: vendor });
};

exports.getVendorDocuments = async (req, res) => {
  const documents = await Document.find({ vendor: req.user.id });
  res.status(200).json({ success: true, data: documents });
};

exports.getVendorMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { receiver: req.user.id, receiverModel: "Vendor" },
      { sender: req.user.id, senderModel: "Vendor" },
    ],
  }).sort("-createdAt");

  res.status(200).json({ success: true, data: messages });
};

exports.registerVendor = async (req, res) => {
  try {
    const { password, email } = req.body;
    console.log("📝 Registration attempt for:", email);

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }

    let documentData = {};
    if (req.file) {
      console.log("📁 Uploading file to Cloudinary:", req.file.path);
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "vms/documents",
        });
        documentData = {
          url: result.secure_url,
          public_id: result.public_id,
          name: req.file.originalname,
        };
        console.log("✅ Cloudinary upload success:", result.secure_url);
      } catch (cloudErr) {
        console.error("❌ Cloudinary Error:", cloudErr);
        return res.status(500).json({ success: false, message: "File upload failed", error: cloudErr.message });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Remove keys that shouldn't go directly into the Vendor model (like file or document)
    const vendorData = { ...req.body };
    delete vendorData.document;
    delete vendorData.password;

    console.log("💾 Creating Vendor record...");
    const vendor = await Vendor.create({
      ...vendorData,
      password: hashedPassword,
      status: "pending",
    });

    await AuditService.logCreate(req, "Vendor", vendor);
    console.log("✅ Vendor created:", vendor._id);

    if (req.file) {
      console.log("💾 Creating Document record...");
      await Document.create({
        vendor: vendor._id,
        ...documentData,
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please wait for admin approval.",
    });
  } catch (err) {
    console.error("❌ Global Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during registration",
      error: err.message,
      stack: err.stack
    });
  }
};

exports.replyMessage = async (req, res) => {
  const { subject, content, receiverId } = req.body;

  const message = await Message.create({
    sender: req.user.id,
    senderModel: "Vendor",
    receiver: receiverId,
    receiverModel: "Admin",
    subject,
    content,
  });

  res.status(201).json({ success: true, data: message });
};

// ==========================================
// ADMIN ENDPOINTS (VENDOR REGISTRY)
// ==========================================

exports.getVendors = async (req, res) => {
  try {
    const { status, lifecycleStatus, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: "approved" };
    if (lifecycleStatus) query.lifecycleStatus = lifecycleStatus;
    if (category) query.category = category;

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .populate("category", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("category", "name")
      .populate("createdFromApplicationId");

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    res.status(200).json({ success: true, data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { lifecycleStatus } = req.body;
    if (!["active", "inactive", "suspended"].includes(lifecycleStatus)) {
      return res.status(400).json({ success: false, message: "Invalid lifecycle status" });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    const beforeData = vendor.toObject();
    vendor.lifecycleStatus = lifecycleStatus;
    await vendor.save();

    await AuditService.logUpdate(req, "VendorLifecycle", vendor._id, beforeData, vendor.toObject());

    res.status(200).json({ success: true, message: `Vendor marked as ${lifecycleStatus}`, data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.blacklistVendor = async (req, res) => {
  try {
    const { reason, remarks } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Reason is required to blacklist a vendor" });

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    const beforeData = vendor.toObject();

    vendor.lifecycleStatus = "blacklisted";
    vendor.blacklistHistory.push({
      reason,
      remarks,
      blacklistedBy: req.user._id,
      blacklistedAt: new Date()
    });

    await vendor.save();

    await AuditService.logUpdate(req, "VendorBlacklist", vendor._id, beforeData, vendor.toObject());

    res.status(200).json({ success: true, message: "Vendor blacklisted successfully", data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.status(200).json({ success: true, message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
