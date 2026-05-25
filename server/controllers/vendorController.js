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
    const SequenceService = require("../services/SequenceService");
    const vendorId = await SequenceService.getNextSequence(req.user?.tenantId || req.body.tenantId, "vendor");

    const vendor = await Vendor.create({
      ...vendorData,
      vendorId,
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

    // --- INDUSTRIAL AUTO-SYNC LOGIC START ---
    try {
      const VendorApplication = require("../models/VendorApplication");
      const TreeSubmission = require("../models/TreeSubmission");
      const SequenceService = require("../services/SequenceService");
      
      const targetTenantId = req.user?.tenantId || "600000000000000000000001";

      const approvedCombined = await Promise.all([
        VendorApplication.find({ status: "approved", tenantId: targetTenantId }).lean(),
        TreeSubmission.find({ status: "approved", tenantId: targetTenantId }).lean()
      ]).then(([a, b]) => [...a, ...b]);

      for (const app of approvedCombined) {
        const email = (app.email || app.vendorEmail || "").toLowerCase().trim();
        const appTenantId = app.tenantId || targetTenantId;
        
        if (!email || !appTenantId) continue;

        // Check if vendor exists
        let vendor = await Vendor.findOne({ email, tenantId: appTenantId });
        
        // Extract phone safely
        let phone = "0000000000";
        const dataMap = app.data instanceof Map ? Object.fromEntries(app.data) : (app.data || {});
        const possiblePhone = dataMap.phone || dataMap.mobile || dataMap.phoneNumber || app.phone || "0000000000";
        phone = String(possiblePhone).replace(/\D/g, '').slice(0, 10).padEnd(10, '0');

        // Generate vendorId if not present
        let vendorId = vendor?.vendorId;
        if (!vendorId) {
            vendorId = await SequenceService.getNextSequence(appTenantId, "vendor");
        }

        // Upsert to bypass uniqueness/validation issues on non-mandatory fields
        await Vendor.findOneAndUpdate(
          { email, tenantId: appTenantId },
          {
            $set: {
              name: app.companyName || app.vendorName || "Active Partner",
              companyName: app.companyName || app.vendorName,
              vendorId: vendorId,
              status: 'active',
              lifecycleStatus: 'active',
              createdFromApplicationId: app._id,
              phone: phone,
              tenantId: appTenantId,
              createdBy: app.approvedBy || req.user?._id || app._id,
              isDeleted: false
            }
          },
          { upsert: true, new: true, runValidators: false }
        );
      }
    } catch (syncFatal) {
      console.error("🚨 Critical Sync Error:", syncFatal.message);
    }
    // --- INDUSTRIAL AUTO-SYNC LOGIC END ---

     let query = {};
     if (status) query.status = status;
     else query.status = { $in: ["active", "approved"] }; // Support both legacy and new statuses

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

/**
 * @desc    Update Vendor detail (Admin Only)
 * @route   PATCH /api/vendors/:id
 */
exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Allowed fields for manual admin edit
        const updateData = {};
        const updatableFields = ["companyName", "name", "email", "phone", "contactPerson", "lifecycleStatus", "category", "gstNumber"];
        
        for(let field of updatableFields) {
            if(req.body[field] !== undefined) {
                // Special handling for Category (Cast empty string to null/undefined)
                if(field === "category" && req.body[field] === "") {
                    updateData[field] = null;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        // Special handling for address (Map string override to city)
        if(req.body.address) {
            if(typeof req.body.address === 'string') {
                updateData.address = { city: req.body.address };
            } else {
                updateData.address = req.body.address;
            }
        }

        const vendor = await Vendor.findById(id);
        if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

        const beforeData = vendor.toObject();
        
        // Perform Update (Disabled runValidators momentarily for debugging)
        console.log("🛠️ Vendor Update Payload:", JSON.stringify(updateData, null, 2));
        
        const updatedVendor = await Vendor.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true, runValidators: false }
        );

        if (!updatedVendor) {
            return res.status(404).json({ success: false, message: "Failed to locate/update vendor record." });
        }

        // Audit Logging
        try {
            const AuditService = require("../services/AuditService");
            await AuditService.log({
                req,
                actionType: "VENDOR_PROFILE_UPDATE",
                entityType: "Vendor",
                entityId: vendor._id,
                beforeData,
                afterData: updatedVendor.toObject(),
                metadata: { remarks: "Administrative correction" }
            });
        } catch (auditErr) {
            console.error("Audit Service Warning:", auditErr.message);
        }

        res.status(200).json({ success: true, data: updatedVendor });
    } catch (err) {
        console.error("❌ updateVendor Fatal Error:", err);
        res.status(400).json({ 
            success: false, 
            message: `Synchronization Error: ${err.message}`,
            debug: err.stack,
            fullError: err
        });
    }
};
