const RFQ = require("../models/RFQ");
const Vendor = require("../models/vendor.model");
const Category = require("../models/Category");
const PurchaseRequest = require("../modules/procurement/models/PurchaseRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendEmail } = require("../utils/emailService");
const NotificationService = require("../services/NotificationService");
const { normalizeRole } = require("../config/roles");

const APPROVAL_STAGES = ["manager", "finance"];

const resolveVendorProfile = async (user) => {
  if (!user) return null;
  const tenantId = user.tenantId;
  const filter = { $or: [{ userId: user._id || user.id }, { email: user.email }] };
  if (tenantId) filter.tenantId = tenantId;
  
  return Vendor.findOne(filter);
};

const mapPrItemsToRfqItems = (items = []) =>
  items.map((item) => ({
    name: item.name || item.description || "Item",
    quantity: Number(item.quantity || item.qty || 1),
    unit: item.unit || item.uom || "Nos",
    specifications: item.specs || item.specifications || "",
  }));

const initializeApprovals = (approvals = {}) => {
  const normalized = {};

  for (const stage of APPROVAL_STAGES) {
    const config = approvals?.[stage] || {};
    const required = config.required === true;
    normalized[stage] = {
      required,
      status: required ? "pending" : "not_required",
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      remarks: "",
    };
  }

  return normalized;
};

const hasRequiredApprovals = (rfq) =>
  APPROVAL_STAGES.some((stage) => rfq?.approvals?.[stage]?.required === true);

const getNextPendingStage = (rfq) => {
  for (const stage of APPROVAL_STAGES) {
    const approval = rfq?.approvals?.[stage];
    if (approval?.required && approval.status === "pending") {
      return stage;
    }
  }
  return null;
};

const allRequiredApprovalsGranted = (rfq) => {
  const requiredStages = APPROVAL_STAGES.filter((stage) => rfq?.approvals?.[stage]?.required === true);
  if (requiredStages.length === 0) return true;
  return requiredStages.every((stage) => rfq?.approvals?.[stage]?.status === "approved");
};

const hasRejectedApproval = (rfq) =>
  APPROVAL_STAGES.some((stage) => rfq?.approvals?.[stage]?.status === "rejected");

const resolveStatusForCreate = (requestedStatus, approvals) => {
  const normalizedApprovals = initializeApprovals(approvals);
  const requiresApproval = hasRequiredApprovals({ approvals: normalizedApprovals });

  if (requestedStatus === "published") {
    return requiresApproval ? "pending_approval" : "published";
  }
  if (requestedStatus === "pending_approval") {
    return requiresApproval ? "pending_approval" : "approved";
  }
  return "draft";
};

const ensureAutoStatus = async (rfq) => {
  if (!rfq || rfq.status !== "published") return rfq;
  if (rfq.quoteDeadline && new Date(rfq.quoteDeadline) < new Date()) {
    rfq.status = "closed";
    await rfq.save({ validateBeforeSave: false });
  }
  return rfq;
};

const fetchApprovedVendors = async ({ tenantId, categoryId, targetedVendorIds = [] }) => {
  const baseFilter = {
    tenantId,
    status: { $in: ["active", "approved"] },
    lifecycleStatus: "active",
  };
  if (categoryId) baseFilter.category = categoryId;
  if (Array.isArray(targetedVendorIds) && targetedVendorIds.length > 0) {
    baseFilter._id = { $in: targetedVendorIds };
  }
  return Vendor.find(baseFilter).select("name companyName email category");
};

// @desc Create RFQ (from approved PR if prId is provided)
exports.createRFQ = asyncHandler(async (req, res, next) => {
  if (!req.user?.tenantId) {
    return next(new AppError("Tenant context missing.", 400));
  }

  const { prId, categoryId } = req.body || {};
  let pr = null;

  if (prId) {
    pr = await PurchaseRequest.findOne({ _id: prId, tenantId: req.user.tenantId });
    if (!pr) return next(new AppError("Purchase request not found.", 404));
    if (pr.status !== "approved") {
      return next(new AppError("Only approved PR can be converted to RFQ.", 400));
    }
  }

  const resolvedCategoryId = categoryId || pr?.categoryId || null;
  if (resolvedCategoryId) {
    const category = await Category.findById(resolvedCategoryId);
    if (!category || category.status !== "active") {
      return next(new AppError("Invalid or inactive category.", 400));
    }
  }

  const approvalConfig = req.body.approvals || { manager: { required: false }, finance: { required: false } };

  const rfqPayload = {
    title: req.body.title || pr?.title,
    description: req.body.description || pr?.description || "RFQ created from PR",
    departmentId: req.body.departmentId || pr?.departmentId || null,
    items: req.body.items?.length ? req.body.items : mapPrItemsToRfqItems(pr?.items || []),
    budget: req.body.budget || { amount: pr?.totalEstimate || 0, currency: pr?.currency || "INR" },
    quoteDeadline: req.body.quoteDeadline ? new Date(new Date(req.body.quoteDeadline).setHours(23, 59, 59, 999)) : null,
    deliveryDeadline: req.body.deliveryDeadline || pr?.requiredBy || null,
    vendorSelection: req.body.vendorSelection || { type: "targeted", targetedVendors: [] },
    termsAndConditions: req.body.termsAndConditions || "",
    approvals: initializeApprovals(approvalConfig),
    status: resolveStatusForCreate(req.body.status || "draft", approvalConfig),
    tenantId: req.user.tenantId,
    createdBy: req.user._id,
    sourcePrId: pr?._id || null,
    categoryId: resolvedCategoryId,
  };

  if (!rfqPayload.title || !rfqPayload.quoteDeadline) {
    return next(new AppError("RFQ title and quote deadline are required.", 400));
  }

  const rfq = await RFQ.create(rfqPayload);
  if (pr) {
    pr.rfqId = rfq._id;
    pr.status = "converted_to_rfq";
    await pr.save({ validateBeforeSave: false });
  }

  if (rfq.status === "published") {
    await exports.sendRFQToVendorsInternal(rfq, req);
  }

  res.status(201).json({ success: true, data: rfq });
});

// @desc Send RFQ to approved vendors (email + dashboard notification)
exports.sendRFQToVendors = asyncHandler(async (req, res, next) => {
  const rfq = await RFQ.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!rfq) return next(new AppError("RFQ not found.", 404));
  if (hasRequiredApprovals(rfq) && !["approved", "published"].includes(rfq.status)) {
    return next(new AppError("RFQ must be fully approved before it can be sent to vendors.", 400));
  }

  await exports.sendRFQToVendorsInternal(rfq, req);
  res.status(200).json({ success: true, message: "RFQ sent to vendors.", data: rfq });
});

exports.sendRFQToVendorsInternal = async (rfq, req) => {
  const vendorSelection = rfq.vendorSelection || { type: "targeted", targetedVendors: [] };
  const targeted = vendorSelection.type === "targeted" ? vendorSelection.targetedVendors : [];

  const approvedVendors = await fetchApprovedVendors({
    tenantId: rfq.tenantId,
    categoryId: rfq.categoryId,
    targetedVendorIds: targeted,
  });

  const vendorEmails = approvedVendors.map((v) => v.email).filter(Boolean);

  for (const email of vendorEmails) {
    await sendEmail({
      to: email,
      subject: `New RFQ: ${rfq.title}`,
      text: `RFQ "${rfq.title}" is available. Submit quotation before ${new Date(rfq.quoteDeadline).toLocaleDateString()}.`,
    });

    const user = await User.findOne({ email, tenantId: rfq.tenantId }).select("_id");
    if (user?._id) {
      await NotificationService.sendNotification(user._id, {
        title: "New RFQ",
        message: `RFQ "${rfq.title}" has been published.`,
        type: "rfq",
        relatedEntityId: rfq._id,
      });
    }
  }

  rfq.status = rfq.status === "draft" ? "published" : rfq.status;
  rfq.sentAt = new Date();
  rfq.sentVendorCount = vendorEmails.length;
  await rfq.save({ validateBeforeSave: false });
};

// @desc Get RFQ details (auto status tracking)
exports.getRFQDetails = asyncHandler(async (req, res, next) => {
  const filter = { _id: req.params.id, tenantId: req.user.tenantId };

  if (normalizeRole(req.user?.role) === "vendor") {
    const vendor = await resolveVendorProfile(req.user);
    if (!vendor) return next(new AppError("Vendor profile not found", 404));
    filter.status = "published";
    filter.$or = [
      { "vendorSelection.type": "open" },
      { "vendorSelection.type": "targeted", "vendorSelection.targetedVendors": vendor._id },
    ];
  }

  let rfq = await RFQ.findOne(filter)
    .populate("departmentId", "name")
    .populate("vendorSelection.targetedVendors", "name companyName email")
    .populate("categoryId", "name");

  if (!rfq) return next(new AppError("RFQ not found", 404));
  rfq = await ensureAutoStatus(rfq);

  res.status(200).json({ success: true, data: rfq });
});

exports.getRFQs = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId || req.user?.tenantId;
  const filter = {};
  
  if (tenantId) {
    filter.tenantId = tenantId;
  } else {
    console.warn("[RFQ] getRFQs called without tenantId context for user:", req.user?._id);
  }

  // Disabled aggressive auto-close for now as it conflicts with today's deadlines
  // Aggressive Auto-Close disabled. 
  // FIX: On-the-fly reopening of RFQs that are still within the deadline (Today or Future)
  try {
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      await RFQ.updateMany(
        { 
          status: "closed", 
          quoteDeadline: { $gte: todayStart }, 
          tenantId: req.user?.tenantId || req.tenantId 
        },
        { $set: { status: "published" } }
      );
  } catch (err) {
      console.error("Self-heal RFQ failed:", err);
  }

  if (normalizeRole(req.user?.role) === "vendor") {
    const vendor = await resolveVendorProfile(req.user);
    if (!vendor) {
      console.warn("[RFQ] Vendor profile not resolved for user:", req.user?._id);
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    filter.status = "published";
    filter.$or = [
      { "vendorSelection.type": "open" },
      { "vendorSelection.type": "targeted", "vendorSelection.targetedVendors": vendor._id },
    ];
  }

  console.log("[RFQ] Fetching RFQs with filter:", JSON.stringify(filter));
  const rfqs = await RFQ.find(filter)
    .populate("departmentId", "name")
    .populate("vendorSelection.targetedVendors", "name companyName email")
    .populate("categoryId", "name")
    .sort("-createdAt");

  console.log("[RFQ] Found", rfqs.length, "RFQs");
  res.status(200).json({ success: true, count: rfqs.length, data: rfqs });
});

exports.updateRFQStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ["pending_approval", "published", "closed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return next(new AppError("Unsupported RFQ status transition.", 400));
  }

  const rfq = await RFQ.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

  if (!rfq) return next(new AppError("RFQ not found", 404));

  if (status === "pending_approval") {
    if (!hasRequiredApprovals(rfq)) {
      return next(new AppError("This RFQ has no approval stages configured.", 400));
    }
    rfq.status = hasRejectedApproval(rfq) ? "rejected" : "pending_approval";
  } else if (status === "published") {
    if (hasRequiredApprovals(rfq) && rfq.status !== "approved") {
      return next(new AppError("RFQ must be fully approved before publishing.", 400));
    }
    rfq.status = "published";
  } else {
    rfq.status = status;
  }

  await rfq.save({ validateBeforeSave: false });

  if (status === "published") {
    await exports.sendRFQToVendorsInternal(rfq, req);
  }

  res.status(200).json({ success: true, data: rfq });
});

exports.reviewRFQ = asyncHandler(async (req, res, next) => {
  const { action, stage, remarks = "" } = req.body || {};
  if (!["approve", "reject"].includes(action)) {
    return next(new AppError("Action must be approve or reject.", 400));
  }

  const rfq = await RFQ.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!rfq) return next(new AppError("RFQ not found", 404));

  if (!hasRequiredApprovals(rfq)) {
    return next(new AppError("This RFQ does not require approval.", 400));
  }

  if (!["pending_approval", "approved", "rejected"].includes(rfq.status)) {
    return next(new AppError("RFQ is not in an approval review state.", 400));
  }

  const nextPendingStage = getNextPendingStage(rfq);
  const resolvedStage = stage || nextPendingStage;

  if (!resolvedStage || !APPROVAL_STAGES.includes(resolvedStage)) {
    return next(new AppError("No pending approval stage available.", 400));
  }

  const approval = rfq.approvals?.[resolvedStage];
  if (!approval?.required) {
    return next(new AppError("Selected approval stage is not required.", 400));
  }

  if (nextPendingStage && resolvedStage !== nextPendingStage) {
    return next(new AppError(`Please complete ${nextPendingStage} approval first.`, 400));
  }

  if (approval.status !== "pending") {
    return next(new AppError(`The ${resolvedStage} approval has already been reviewed.`, 400));
  }

  if (action === "reject" && !String(remarks || "").trim()) {
    return next(new AppError("Rejection reason is required.", 400));
  }

  approval.remarks = remarks;

  if (action === "approve") {
    approval.status = "approved";
    approval.approvedBy = req.user._id;
    approval.approvedAt = new Date();
    approval.rejectedBy = null;
    approval.rejectedAt = null;
  } else {
    approval.status = "rejected";
    approval.rejectedBy = req.user._id;
    approval.rejectedAt = new Date();
    approval.approvedBy = null;
    approval.approvedAt = null;
    rfq.rejectionReason = remarks;
  }

  rfq.approvalHistory.push({
    stage: resolvedStage,
    action: action === "approve" ? "approved" : "rejected",
    actedBy: req.user._id,
    actedAt: new Date(),
    remarks,
  });

  if (action === "reject") {
    rfq.status = "rejected";
  } else if (allRequiredApprovalsGranted(rfq)) {
    rfq.status = "approved";
    rfq.rejectionReason = "";
  } else {
    rfq.status = "pending_approval";
  }

  await rfq.save();

  res.status(200).json({
    success: true,
    message: `RFQ ${action === "approve" ? "approved" : "rejected"} for ${resolvedStage} stage.`,
    data: rfq,
  });
});

exports.updateRFQ = asyncHandler(async (req, res, next) => {
  const rfq = await RFQ.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!rfq) return next(new AppError("RFQ not found", 404));
  res.status(200).json({ success: true, data: rfq });
});
