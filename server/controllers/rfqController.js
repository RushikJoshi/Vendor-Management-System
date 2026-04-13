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

const resolveVendorProfile = async (user) => {
  if (!user) return null;
  let vendor = await Vendor.findOne({ userId: user._id || user.id, tenantId: user.tenantId });
  if (!vendor && user.email) {
    vendor = await Vendor.findOne({ email: user.email, tenantId: user.tenantId });
  }
  return vendor;
};

const mapPrItemsToRfqItems = (items = []) =>
  items.map((item) => ({
    name: item.name || item.description || "Item",
    quantity: Number(item.quantity || item.qty || 1),
    unit: item.unit || item.uom || "Nos",
    specifications: item.specs || item.specifications || "",
  }));

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

  const rfqPayload = {
    title: req.body.title || pr?.title,
    description: req.body.description || pr?.description || "RFQ created from PR",
    departmentId: req.body.departmentId || pr?.departmentId || null,
    items: req.body.items?.length ? req.body.items : mapPrItemsToRfqItems(pr?.items || []),
    budget: req.body.budget || { amount: pr?.totalEstimate || 0, currency: pr?.currency || "INR" },
    quoteDeadline: req.body.quoteDeadline,
    deliveryDeadline: req.body.deliveryDeadline || pr?.requiredBy || null,
    vendorSelection: req.body.vendorSelection || { type: "targeted", targetedVendors: [] },
    termsAndConditions: req.body.termsAndConditions || "",
    status: req.body.status || "draft",
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

// Existing list/update endpoints
exports.getRFQs = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId || req.user?.tenantId;
  const filter = { tenantId };

  if (normalizeRole(req.user?.role) === "vendor") {
    const vendor = await resolveVendorProfile(req.user);
    if (!vendor) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    filter.status = "published";
    filter.$or = [
      { "vendorSelection.type": "open" },
      { "vendorSelection.type": "targeted", "vendorSelection.targetedVendors": vendor._id },
    ];
  }

  const rfqs = await RFQ.find(filter)
    .populate("departmentId", "name")
    .populate("vendorSelection.targetedVendors", "name companyName email")
    .populate("categoryId", "name")
    .sort("-createdAt");

  for (const rfq of rfqs) {
    await ensureAutoStatus(rfq);
  }

  res.status(200).json({ success: true, count: rfqs.length, data: rfqs });
});

exports.updateRFQStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const rfq = await RFQ.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { status },
    { new: true, runValidators: true }
  );

  if (!rfq) return next(new AppError("RFQ not found", 404));

  if (status === "published") {
    await exports.sendRFQToVendorsInternal(rfq, req);
  }

  res.status(200).json({ success: true, data: rfq });
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
