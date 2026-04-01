const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
const TreeForm = require("../models/TreeForm");
const TreeSubmission = require("../models/TreeSubmission");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const defaultVendorTemplate = require("../constants/defaultVendorTemplate");

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const normalizeKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const flattenFields = (nodes = [], level = "1", parentTitle = "", acc = []) => {
  nodes.forEach((node, idx) => {
    const plainNode = typeof node?.toObject === "function" ? node.toObject() : node;
    const nodeNumber = level ? `${level}.${idx + 1}` : `${idx + 1}`;
    const nodePath = `${nodeNumber} ${plainNode?.title || ""}`.trim();
    (plainNode?.fields || []).forEach((field) => {
      const plainField = typeof field?.toObject === "function" ? field.toObject() : field;
      acc.push({
        ...plainField,
        nodeId: plainNode?.id,
        nodePath,
        parentTitle,
      });
    });
    flattenFields(plainNode?.children || [], nodeNumber, plainNode?.title, acc);
  });
  return acc;
};

const normalizeFieldMeta = (field = {}, index = 0) => {
  const rawId = field.id || field.fieldId || field.name || field.key;
  const rawLabel = field.label || field.fieldLabel || field.title || field.name || rawId;
  const rawType = field.type || field.fieldType || field.inputType || "text";

  return {
    fieldId: String(rawId || `field_${index + 1}`),
    label: String(rawLabel || `Field ${index + 1}`),
    type: String(rawType || "text"),
  };
};

const flattenValueObject = (input, prefix = "", acc = {}) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return acc;
  Object.entries(input).forEach(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenValueObject(value, nextPrefix, acc);
      return;
    }
    acc[nextPrefix] = value;
    acc[key] = value;
  });
  return acc;
};

const generatePassword = () => {
  const raw = crypto.randomBytes(6).toString("base64").replace(/[^a-zA-Z0-9]/g, "");
  return `${raw.slice(0, 10)}A1!`;
};

const sendVendorApprovalEmail = async ({ to, vendorName, temporaryPassword }) => {
  const loginLink = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"}/login`;
  await sendEmail({
    to,
    subject: "Your Vendor Account Has Been Approved",
    templateName: "vendorOnboardingApproved",
    placeholders: {
      vendorName: vendorName || "Vendor",
      loginLink,
      email: to,
      temporaryPassword,
      supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "support@vmspro.com",
    },
    text: `Your vendor account is approved. Login: ${loginLink} Email: ${to} Temporary Password: ${temporaryPassword}`,
  });
};

exports.createForm = async (req, res) => {
  try {
    const { code, name, categoryName = "", version = 1, structure = [], status = "draft" } = req.body;
    if (!name || !Array.isArray(structure)) {
      return res.status(400).json({ success: false, message: "name and structure are required." });
    }

    const form = await TreeForm.create({
      code: code || undefined,
      name: name.trim(),
      categoryName: categoryName.trim(),
      version,
      structure,
      status,
      createdBy: req.user?._id,
    });

    return res.status(201).json({ success: true, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDefaultForm = async (req, res) => {
  try {
    const existing = await TreeForm.findOne({ code: defaultVendorTemplate.code });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Default template already exists.",
        data: existing,
      });
    }

    const created = await TreeForm.create({
      ...defaultVendorTemplate,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Default template created.",
      data: created,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await TreeForm.findOne({ code: defaultVendorTemplate.code });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Default template already exists.",
          data: existing,
        });
      }
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Default template validation failed.",
        errors: Object.values(error.errors || {}).map((e) => e.message),
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFormById = async (req, res) => {
  try {
    const form = await TreeForm.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getForms = async (req, res) => {
  try {
    const forms = await TreeForm.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: forms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryName, structure, status, version } = req.body;
    const form = await TreeForm.findById(id);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });

    form.name = name || form.name;
    form.categoryName = typeof categoryName === "string" ? categoryName : form.categoryName;
    form.structure = Array.isArray(structure) ? structure : form.structure;
    form.status = status || form.status;
    form.version = version || form.version;
    await form.save();

    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitForm = async (req, res) => {
  try {
    const { formId } = req.body;
    if (!formId) return res.status(400).json({ success: false, message: "formId is required." });

    const form = await TreeForm.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });

    const payload = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
    const responseMap = Array.isArray(payload.responses)
      ? payload.responses.reduce((acc, row) => {
          const key = row?.fieldId || row?.id || row?.name;
          if (key) acc[key] = row.value;
          if (row?.label) acc[row.label] = row.value;
          return acc;
        }, {})
      : {};
    const valuesArrayMap = Array.isArray(payload.values)
      ? payload.values.reduce((acc, row, idx) => {
          if (row && typeof row === "object" && !Array.isArray(row)) {
            const key = row.fieldId || row.id || row.name;
            if (key) {
              acc[key] = row.value;
              return acc;
            }
          }
          acc[`field_${idx + 1}`] = row;
          return acc;
        }, {})
      : {};
    const valuesObjectInput = payload.values && typeof payload.values === "object" && !Array.isArray(payload.values) ? payload.values : {};
    const flattenedValues = flattenValueObject(valuesObjectInput);
    const values = {
      ...valuesObjectInput,
      ...flattenedValues,
      ...valuesArrayMap,
      ...responseMap,
    };
    const normalizedValues = Object.entries(values).reduce((acc, [key, value]) => {
      const nk = normalizeKey(key);
      if (nk && !Object.prototype.hasOwnProperty.call(acc, nk)) acc[nk] = value;
      return acc;
    }, {});
    const files = req.files || [];

    const flatFields = flattenFields(form.structure, "", form.name, []);
    const errors = [];

    const data = flatFields.map((field, index) => {
      const meta = normalizeFieldMeta(field, index);
      const candidateKeys = [
        meta.fieldId,
        field.id,
        field.fieldId,
        field.name,
        meta.label,
        field.label,
        field.title,
      ].filter(Boolean);
      const upload = files.find((f) => candidateKeys.some((key) => f.fieldname === `file_${key}`));
      const valueKey = candidateKeys.find((key) => Object.prototype.hasOwnProperty.call(values, key));
      const directValue = valueKey ? values[valueKey] : undefined;
      const normalizedKey = candidateKeys.map((k) => normalizeKey(k)).find((k) => Object.prototype.hasOwnProperty.call(normalizedValues, k));
      const value = directValue !== undefined ? directValue : normalizedKey ? normalizedValues[normalizedKey] : undefined;

      if (field.required) {
        if (meta.type === "file" && !upload) errors.push(`${meta.label} is required.`);
        if (meta.type !== "file") {
          const empty =
            value === undefined ||
            value === null ||
            (Array.isArray(value) ? value.length === 0 : String(value).trim() === "");
          if (empty) errors.push(`${meta.label} is required.`);
        }
      }

      if (value && meta.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        errors.push(`Invalid email format in ${meta.label}`);
      }
      if (value && field.validation?.pattern === "pan" && !PAN_REGEX.test(String(value).toUpperCase())) {
        errors.push(`Invalid PAN format in ${meta.label}`);
      }
      if (value && field.validation?.pattern === "gst" && !GST_REGEX.test(String(value).toUpperCase())) {
        errors.push(`Invalid GST format in ${meta.label}`);
      }

      if (upload) {
        const ext = path.extname(upload.originalname).replace(".", "").toLowerCase();
        const allowed = field.validation?.allowedFileTypes || [];
        if (allowed.length && !allowed.includes(ext)) {
          errors.push(`${meta.label} file type must be: ${allowed.join(", ")}`);
        }
        const maxMb = Number(field.validation?.maxFileSizeMB || 5);
        if (upload.size > maxMb * 1024 * 1024) {
          errors.push(`${meta.label} file must be <= ${maxMb}MB`);
        }
      }

      return {
        fieldId: meta.fieldId,
        label: meta.label,
        type: meta.type,
        nodePath: field.nodePath,
        value: meta.type === "file" ? null : value ?? "",
        fileUrl: upload ? `/uploads/tree-submissions/${path.basename(upload.path)}` : null,
        fileName: upload ? upload.originalname : null,
      };
    });

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const emailEntry = data.find((x) => x.type === "email");
    const nameEntry = data.find((x) => /name/i.test(x.fieldId) || /name/i.test(x.label));

    const submission = await TreeSubmission.create({
      formId: form._id,
      formName: form.name,
      categoryName: form.categoryName || "",
      data,
      status: "pending",
      vendorEmail: (emailEntry?.value || "").toString().trim().toLowerCase(),
      vendorName: (nameEntry?.value || "").toString().trim(),
    });

    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const rows = await TreeSubmission.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const row = await TreeSubmission.findById(req.params.id).populate("formId", "name structure");
    if (!row) return res.status(404).json({ success: false, message: "Submission not found." });
    return res.status(200).json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const { submissionId, action = "approved", rejectionReason = "" } = req.body;
    if (!submissionId) return res.status(400).json({ success: false, message: "submissionId is required." });

    const submission = await TreeSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found." });
    if (submission.status !== "pending") {
      return res.status(400).json({ success: false, message: `Submission already ${submission.status}.` });
    }

    if (action === "rejected") {
      submission.status = "rejected";
      submission.rejectionReason = rejectionReason || "Rejected by admin";
      submission.reviewedBy = req.user?._id;
      submission.reviewedAt = new Date();
      await submission.save();
      return res.status(200).json({ success: true, data: submission });
    }

    if (!submission.vendorEmail) {
      return res.status(400).json({ success: false, message: "Vendor email missing in submission data." });
    }

    let user = await User.findOne({ email: submission.vendorEmail });
    const generatedPassword = generatePassword();

    if (!user) {
      user = await User.create({
        name: submission.vendorName || "Vendor User",
        email: submission.vendorEmail,
        password: generatedPassword,
        role: "vendor",
        status: "active",
        mustChangePassword: true,
      });
    } else {
      if (String(user.role || "").toLowerCase() !== "vendor") {
        return res.status(409).json({
          success: false,
          message: "This email is already used by a non-vendor account.",
        });
      }
      user.name = submission.vendorName || user.name || "Vendor User";
      user.role = "vendor";
      user.status = "active";
      user.password = generatedPassword;
      user.mustChangePassword = true;
      await user.save();
    }

    submission.status = "approved";
    submission.rejectionReason = "";
    submission.vendorUserId = user._id;
    submission.reviewedBy = req.user?._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await sendVendorApprovalEmail({
      to: user.email,
      vendorName: user.name,
      temporaryPassword: generatedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Submission approved. Vendor account created and credentials sent via email.",
      data: submission,
      mockEmail: {
        to: user.email,
        subject: "Vendor Account Approved",
        credentials: { email: user.email, password: generatedPassword },
        loginLink: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"}/login`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.gstAutofill = async (req, res) => {
  try {
    const { gstNumber } = req.body;
    if (!gstNumber || !GST_REGEX.test(String(gstNumber).toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid GST number." });
    }

    const externalUrl = process.env.GST_API_URL;
    if (externalUrl) {
      try {
        const apiRes = await axios.get(`${externalUrl}${gstNumber}`);
        return res.status(200).json({ success: true, data: apiRes.data });
      } catch (e) {
        // fallback below
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        gstNumber: gstNumber.toUpperCase(),
        companyName: "Mock GST Registered Company Pvt Ltd",
      },
      source: "mock",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.ifscAutofill = async (req, res) => {
  try {
    const { ifsc } = req.body;
    if (!ifsc || !IFSC_REGEX.test(String(ifsc).toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid IFSC." });
    }

    try {
      const apiRes = await axios.get(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`, { timeout: 4000 });
      return res.status(200).json({ success: true, data: apiRes.data });
    } catch (e) {
      return res.status(200).json({
        success: true,
        data: {
          IFSC: ifsc.toUpperCase(),
          BANK: "Mock Bank",
          BRANCH: "Mock Branch",
          ADDRESS: "Mock Address",
        },
        source: "mock",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
