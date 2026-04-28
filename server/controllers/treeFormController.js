const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
const TreeForm = require("../models/TreeForm");
const TreeSubmission = require("../models/TreeSubmission");
const User = require("../models/User");
const Category = require("../models/Category");
const sendEmail = require("../utils/email");
const defaultVendorTemplate = require("../constants/defaultVendorTemplate");

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const CIN_REGEX = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
const MSME_REGEX = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;
const MOBILE_REGEX = /^[0-9]{10,15}$/;

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
    dependsOn: field.dependsOn || null,
    dependsOnValue: field.dependsOnValue || null,
  };
};

const getValueFromSources = (keys = [], values = {}, normalizedValues = {}) => {
  const directKey = keys.find((key) => Object.prototype.hasOwnProperty.call(values, key));
  if (directKey) return values[directKey];

  const normalizedKey = keys
    .map((key) => normalizeKey(key))
    .find((key) => Object.prototype.hasOwnProperty.call(normalizedValues, key));

  return normalizedKey ? normalizedValues[normalizedKey] : undefined;
};

const isFieldActive = (field = {}, meta = {}, values = {}, normalizedValues = {}) => {
  const fieldKey = normalizeKey(meta.fieldId);

  if (meta.dependsOn) {
    const dependencyValue = getValueFromSources([meta.dependsOn], values, normalizedValues);
    if (String(dependencyValue || "").trim() !== String(meta.dependsOnValue || "").trim()) {
      return false;
    }
  }

  if (fieldKey.includes("pannum")) {
    const panStatus = getValueFromSources(["panStatus", "f_pan_status", "pan_status"], values, normalizedValues);
    return String(panStatus || "").trim().toLowerCase() === "available";
  }

  if (fieldKey.includes("pfno") || fieldKey.includes("pfnum")) {
    const pfStatus = getValueFromSources(["pfStatus", "f_pf_status", "pf_status"], values, normalizedValues);
    return String(pfStatus || "").trim().toLowerCase() === "yes";
  }

  if (fieldKey.includes("esino") || fieldKey.includes("esinum")) {
    const esiStatus = getValueFromSources(["esiStatus", "f_esi_status", "esi_status"], values, normalizedValues);
    return String(esiStatus || "").trim().toLowerCase() === "yes";
  }

  return true;
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

const normalizeDecisionAction = (action = "") => {
  const value = String(action || "").trim().toLowerCase();
  const map = {
    approved: "approve",
    approve: "approve",
    rejected: "reject",
    reject: "reject",
    send_back: "send_back",
    sendback: "send_back",
    correction: "send_back",
    hold: "hold",
    escalate: "escalate",
    conditional_approve: "conditional_approve",
    conditionalapprove: "conditional_approve",
  };
  return map[value] || "";
};

const mapApplicationStatusToSubmissionStatus = (status = "") => {
  const value = String(status || "").toLowerCase();
  if (value === "submitted" || value === "draft") return "pending";
  if (value === "changes_requested") return "needs_correction";
  if (value === "in_review") return "on_hold";
  return value || "pending";
};

const DECISION_STATUS_MAP = {
  approve: "approved",
  reject: "rejected",
  send_back: "needs_correction",
  hold: "on_hold",
  escalate: "escalated",
  conditional_approve: "conditionally_approved",
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
      
      // DEEP FALLBACK: Check for ANY instance of this field (ID_1, ID_2, etc.)
      let resolvedValue = valueKey ? values[valueKey] : undefined;
      if (resolvedValue === undefined) {
        for (const k of candidateKeys) {
          const suffixKey = Object.keys(values).find(vk => vk.startsWith(`${k}_`));
          if (suffixKey) {
            resolvedValue = values[suffixKey];
            break;
          }
        }
      }

      const directValue = resolvedValue;
      const normalizedKey = candidateKeys.map((k) => normalizeKey(k)).find((k) => Object.prototype.hasOwnProperty.call(normalizedValues, k));
      const value = directValue !== undefined ? directValue : normalizedKey ? normalizedValues[normalizedKey] : undefined;
      const activeField = isFieldActive(field, meta, values, normalizedValues);

      if (field.required && activeField) {
        if (meta.type === "file" && !upload) errors.push(`${meta.label} is required.`);
        if (meta.type !== "file") {
          const empty =
            value === undefined ||
            value === null ||
            (Array.isArray(value) ? value.length === 0 : String(value).trim() === "");
          if (empty) errors.push(`${meta.label} is required.`);
        }
      }

      if (value && activeField && meta.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        errors.push(`Invalid email format in ${meta.label}`);
      }
      if (value && activeField && field.validation?.pattern === "pan" && !PAN_REGEX.test(String(value).toUpperCase())) {
        errors.push(`Invalid PAN format in ${meta.label}`);
      }
      if (value && activeField && field.validation?.pattern === "gst" && !GST_REGEX.test(String(value).toUpperCase())) {
        errors.push(`Invalid GST format in ${meta.label}`);
      }

      // Label-based strict validation for specific industrial fields
      const labelLo = meta.label.toLowerCase();
      const valStr = String(value || "").trim().toUpperCase();
      const isPanNumberField =
        labelLo.includes("pan number") ||
        labelLo.includes("pan no") ||
        normalizeKey(meta.fieldId).includes("pannum");

      if (valStr && activeField) {
        if ((labelLo.includes("mobile") || labelLo.includes("phone")) && !MOBILE_REGEX.test(valStr)) {
          errors.push(`${meta.label} must be 10-15 digits.`);
        }
        if (isPanNumberField && !PAN_REGEX.test(valStr)) {
          errors.push(`Invalid PAN format in ${meta.label}`);
        }
        if (labelLo.includes("cin") && !CIN_REGEX.test(valStr)) {
          errors.push(`Invalid CIN format in ${meta.label} (Expected 21 chars)`);
        }
        if (labelLo.includes("msme") && !MSME_REGEX.test(valStr)) {
          errors.push(`Invalid MSME format in ${meta.label} (Expected UDYAM-XX-00-1234567)`);
        }
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

    // 🎯 DYNAMIC CATEGORY SYNC
    // Detect if vendor filled 'Category' or 'Sub Category' and ensure it exists in registry
    try {
      const categoryEntries = data.filter(x => 
        (x.label === "Category" || x.label === "Sub Category" || x.label === "serviceCategory") && 
        x.value && typeof x.value === "string"
      );

      for (const entry of categoryEntries) {
        let finalName = entry.value.trim();
        if (finalName.includes(' > ')) {
            const parts = finalName.split(' > ');
            finalName = parts[parts.length - 1].split(' (')[0].trim();
        }

        if (finalName) {
            let existingCat = await Category.findOne({ name: { $regex: new RegExp(`^${finalName}$`, "i") } });
            if (!existingCat) {
                const baseCode = finalName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10);
                await Category.create({
                    name: finalName,
                    code: `${baseCode}_${Math.floor(Math.random() * 10000)}`,
                    description: `Auto-created from Tree Form submission: ${entry.value}`,
                    status: "active"
                });
                console.log(`✨ New category auto-registered from tree form: ${finalName}`);
            }
        }
      }
    } catch (catError) {
      console.error("Category Sync Error:", catError.message);
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
    const VendorApplication = require("../models/VendorApplication");
    const FormTemplate = require("../models/FormTemplate");

    const [treeRows, appRows] = await Promise.all([
      TreeSubmission.find().sort({ createdAt: -1 }),
      VendorApplication.find().populate("category", "name").populate("formTemplate").sort({ createdAt: -1 }),
    ]);

    // Harmonize VendorApplication records to match TreeSubmission shape
    const harmonizedApps = appRows.map((app) => {
      const appObj = app.toObject();
      const dataMap =
        app.data instanceof Map
          ? Object.fromEntries(app.data)
          : appObj.data || {};

      // Try to use FormTemplate sections for proper grouping
      const template = appObj.formTemplate;
      const sections = template?.sections || [];
      const usedKeys = new Set();
      const dataArray = [];

      if (sections.length > 0) {
        // Map data using actual form template sections
        sections.forEach((section, sIdx) => {
          const sectionTitle = section.sectionTitle || `Section ${sIdx + 1}`;
          // Don't add prefix if sectionTitle already starts with a number
          const alreadyNumbered = /^\d/.test(sectionTitle);
          const nodePath = alreadyNumbered ? sectionTitle : `1.${sIdx + 1} ${sectionTitle}`;

          (section.fields || []).forEach((field) => {
            const fieldId = field.fieldId || field.name || field.label;
            if (!fieldId) return;

            // Try multiple key formats to find the value
            const candidateKeys = [fieldId, field.name, field.label].filter(Boolean);
            let matchedKey = candidateKeys.find((k) => dataMap.hasOwnProperty(k));
            
            // Also try lowercase and normalized versions
            if (!matchedKey) {
              const normalizedMap = {};
              Object.keys(dataMap).forEach(k => { normalizedMap[k.toLowerCase()] = k; });
              matchedKey = candidateKeys.find(k => normalizedMap[k.toLowerCase()]);
              if (matchedKey) matchedKey = normalizedMap[matchedKey.toLowerCase()];
            }

            const value = matchedKey ? dataMap[matchedKey] : undefined;
            if (matchedKey) usedKeys.add(matchedKey);

            if (value !== undefined && value !== null && String(value).trim() !== "") {
              dataArray.push({
                fieldId: fieldId,
                label: field.label || fieldId,
                type: field.type?.type || field.type || "text",
                nodePath: nodePath,
                value: value,
                fileUrl: null,
                fileName: null,
              });
            }
          });
        });
      }

      // Add remaining unmapped fields under a generic section
      Object.entries(dataMap).forEach(([key, value]) => {
        if (usedKeys.has(key)) return;
        if (value === undefined || value === null || String(value).trim() === "") return;
        // Skip internal/meta fields
        if (["formTemplateId", "categoryId", "invitationToken", "__v"].includes(key)) return;

        dataArray.push({
          fieldId: key,
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase())
            .replace(/_/g, " ")
            .trim(),
          type: typeof value === "string" && value.includes("@") ? "email" : "text",
          nodePath: sections.length > 0 ? "Other Information" : "Registration Form Data",
          value: value,
          fileUrl: null,
          fileName: null,
        });
      });

      // Add documents as file entries
      const docEntries = (appObj.documents || []).map((doc) => ({
        fieldId: doc.fieldName || doc.name,
        label: doc.fieldName || doc.name || "Document",
        type: "file",
        nodePath: "Uploaded Documents",
        value: null,
        fileUrl: doc.url || null,
        fileName: doc.name || "Document",
      }));

      // Better vendor name extraction
      const vendorName =
        appObj.companyName && appObj.companyName !== "Dossier Submission" && appObj.companyName !== "Incomplete Profile" && appObj.companyName !== "Vendor Submission"
          ? appObj.companyName
          : dataMap.companyName || dataMap.company_name || dataMap.co_name || dataMap.vendorName || dataMap.fullTradeName || dataMap.legalName || dataMap.legal_name || dataMap.tradeName || dataMap.trade_name || dataMap.supplierName || appObj.companyName || "Vendor";

      return {
        _id: appObj._id,
        formId: appObj.formTemplate?._id || appObj.formTemplate,
        formName: appObj.category?.name
          ? `${appObj.category.name} Registration`
          : template?.name || "Vendor Registration",
        categoryName: appObj.category?.name || "General",
        data: [...dataArray, ...docEntries],
        status: mapApplicationStatusToSubmissionStatus(appObj.status),
        rejectionReason: "",
        vendorEmail: appObj.vendorEmail || appObj.email || "",
        vendorName: vendorName,
        vendorUserId: appObj.approvedBy || null,
        reviewedBy: appObj.approvedBy || appObj.rejectedBy || null,
        reviewedAt: appObj.approvedAt || appObj.rejectedAt || null,
        createdAt: appObj.createdAt,
        updatedAt: appObj.updatedAt,
        _source: "application",
        _applicationId: appObj._id,
      };
    });

    // Merge and sort by date
    const allRows = [...treeRows.map((r) => ({ ...r.toObject(), _source: "tree" })), ...harmonizedApps].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ success: true, data: allRows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const row = await TreeSubmission.findById(req.params.id).populate("formId", "name structure");
    if (row) {
      return res.status(200).json({ success: true, data: { ...row.toObject(), _source: "tree" } });
    }

    // Fallback: try VendorApplication
    const VendorApplication = require("../models/VendorApplication");
    const app = await VendorApplication.findById(req.params.id).populate("category", "name").populate("formTemplate");
    if (!app) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    const appObj = app.toObject();
    const dataMap =
      app.data instanceof Map
        ? Object.fromEntries(app.data)
        : appObj.data || {};

    // Use FormTemplate sections for proper grouping
    const template = appObj.formTemplate;
    const sections = template?.sections || [];
    const usedKeys = new Set();
    const dataArray = [];

    if (sections.length > 0) {
      sections.forEach((section, sIdx) => {
        const sectionTitle = section.sectionTitle || `Section ${sIdx + 1}`;
          const alreadyNumbered = /^\d/.test(sectionTitle);
          const nodePath = alreadyNumbered ? sectionTitle : `1.${sIdx + 1} ${sectionTitle}`;

        (section.fields || []).forEach((field) => {
          const fieldId = field.fieldId || field.name || field.label;
          if (!fieldId) return;

          const candidateKeys = [fieldId, field.name, field.label].filter(Boolean);
          let matchedKey = candidateKeys.find((k) => dataMap.hasOwnProperty(k));

          if (!matchedKey) {
            const normalizedMap = {};
            Object.keys(dataMap).forEach(k => { normalizedMap[k.toLowerCase()] = k; });
            matchedKey = candidateKeys.find(k => normalizedMap[k.toLowerCase()]);
            if (matchedKey) matchedKey = normalizedMap[matchedKey.toLowerCase()];
          }

          const value = matchedKey ? dataMap[matchedKey] : undefined;
          if (matchedKey) usedKeys.add(matchedKey);

          if (value !== undefined && value !== null && String(value).trim() !== "") {
            dataArray.push({
              fieldId: fieldId,
              label: field.label || fieldId,
              type: field.type?.type || field.type || "text",
              nodePath: nodePath,
              value: value,
              fileUrl: null,
              fileName: null,
            });
          }
        });
      });
    }

    // Add remaining unmapped fields
    Object.entries(dataMap).forEach(([key, value]) => {
      if (usedKeys.has(key)) return;
      if (value === undefined || value === null || String(value).trim() === "") return;
      if (["formTemplateId", "categoryId", "invitationToken", "__v"].includes(key)) return;

      dataArray.push({
        fieldId: key,
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase())
          .replace(/_/g, " ")
          .trim(),
        type: typeof value === "string" && value.includes("@") ? "email" : "text",
        nodePath: sections.length > 0 ? "Other Information" : "Registration Form Data",
        value: value,
        fileUrl: null,
        fileName: null,
      });
    });

    const docEntries = (appObj.documents || []).map((doc) => ({
      fieldId: doc.fieldName || doc.name,
      label: doc.fieldName || doc.name || "Document",
      type: "file",
      nodePath: "Uploaded Documents",
      value: null,
      fileUrl: doc.url || null,
      fileName: doc.name || "Document",
    }));

    const vendorName =
      appObj.companyName && appObj.companyName !== "Dossier Submission" && appObj.companyName !== "Incomplete Profile" && appObj.companyName !== "Vendor Submission"
        ? appObj.companyName
        : dataMap.companyName || dataMap.company_name || dataMap.co_name || dataMap.vendorName || dataMap.fullTradeName || dataMap.legalName || dataMap.legal_name || dataMap.tradeName || dataMap.trade_name || dataMap.supplierName || appObj.companyName || "Vendor";

    const harmonized = {
      _id: appObj._id,
      formId: appObj.formTemplate?._id || appObj.formTemplate,
      formName: appObj.category?.name
        ? `${appObj.category.name} Registration`
        : template?.name || "Vendor Registration",
      categoryName: appObj.category?.name || "General",
      data: [...dataArray, ...docEntries],
      status: mapApplicationStatusToSubmissionStatus(appObj.status),
      rejectionReason: "",
      vendorEmail: appObj.vendorEmail || appObj.email || "",
      vendorName: vendorName,
      vendorUserId: appObj.approvedBy || null,
      reviewedBy: appObj.approvedBy || appObj.rejectedBy || null,
      reviewedAt: appObj.approvedAt || appObj.rejectedAt || null,
      createdAt: appObj.createdAt,
      updatedAt: appObj.updatedAt,
      _source: "application",
      _applicationId: appObj._id,
    };

    return res.status(200).json({ success: true, data: harmonized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const { submissionId, action = "approved", rejectionReason = "", reason = "", riskLevel, riskScore } = req.body;
    if (!submissionId) return res.status(400).json({ success: false, message: "submissionId is required." });
    const normalizedAction = normalizeDecisionAction(action);
    if (!normalizedAction) {
      return res.status(400).json({ success: false, message: "Invalid decision action." });
    }

    const decisionReason = String(reason || rejectionReason || "").trim();
    const requiresReason = normalizedAction !== "approve";
    if (requiresReason && !decisionReason) {
      return res.status(400).json({ success: false, message: "Reason is required for this decision." });
    }

    // First try TreeSubmission
    const submission = await TreeSubmission.findById(submissionId);
    
    if (!submission) {
      // Fallback: try VendorApplication
      const VendorApplication = require("../models/VendorApplication");
      const app = await VendorApplication.findById(submissionId);
      if (!app) {
        return res.status(404).json({ success: false, message: "Submission not found." });
      }

      const actionableStatuses = ["submitted", "in_review", "draft", "changes_requested", "pending"];
      if (!actionableStatuses.includes(app.status)) {
        return res.status(400).json({ success: false, message: `Submission already ${app.status}.` });
      }

      if (normalizedAction !== "approve") {
        if (normalizedAction === "reject") {
          app.status = "rejected";
          app.rejectedAt = new Date();
          app.rejectedBy = req.user?._id;
        } else if (normalizedAction === "send_back") {
          app.status = "changes_requested";
        } else if (["hold", "escalate", "conditional_approve"].includes(normalizedAction)) {
          app.status = "in_review";
        }

        app.approvalHistory = app.approvalHistory || [];
        app.approvalHistory.push({
          stage: app.currentStage || "TECHNICAL",
          approver: req.user?._id,
          status: normalizedAction === "reject" ? "rejected" : "changes_requested",
          remarks: decisionReason,
          actionDate: new Date(),
        });

        await app.save({ validateBeforeSave: false });
        return res.status(200).json({
          success: true,
          data: app,
          message: `Submission marked as ${mapApplicationStatusToSubmissionStatus(app.status)}.`,
        });
      }

      // Approve VendorApplication
      const vendorEmail = app.vendorEmail || app.email;
      if (!vendorEmail) {
        return res.status(400).json({ success: false, message: "Vendor email missing in submission data." });
      }

      let user = await User.findOne({ email: vendorEmail });
      const generatedPassword = generatePassword();

      if (!user) {
        user = await User.create({
          name: app.companyName || "Vendor User",
          email: vendorEmail,
          password: generatedPassword,
          role: "vendor",
          status: "active",
          mustChangePassword: true,
          tenantId: req.user?.tenantId,
        });
      } else {
        // If user already exists, we only update them to 'vendor' if they aren't already an Admin/HR.
        // If they are an Admin, we just proceed to link/update their Vendor profile.
        const existingRole = String(user.role || "").toLowerCase();
        
        if (existingRole === "vendor") {
            user.name = app.companyName || user.name || "Vendor User";
            user.status = "active";
            user.password = generatedPassword;
            user.mustChangePassword = true;
            user.tenantId = req.user?.tenantId;
            await user.save();
        } else {
            console.log(`Bypassing User role update for existing non-vendor account: ${vendorEmail} (Role: ${existingRole})`);
        }
      }

      const VendorModel = require("../models/vendor.model");
      let vendor = await VendorModel.findOne({ email: vendorEmail, tenantId: req.user.tenantId });
      if (!vendor) {
        const dataMap = app.data instanceof Map ? Object.fromEntries(app.data) : (app.data || {});
        const getVal = (key) => dataMap[key] || "";

        vendor = await VendorModel.create({
          name: app.companyName || "Active Partner",
          email: vendorEmail,
          companyName: app.companyName,
          status: "active",
          phone: String(getVal("co_mobile") || getVal("mobileNumber") || getVal("phone") || "0000000000").replace(/[^0-9]/g, "").slice(0, 10) || "0000000000",
          category: app.category,
          address: {
            city: getVal("city") || "N/A",
            state: getVal("state") || "N/A",
            pincode: getVal("pincode") || "000000",
          },
          tenantId: req.user.tenantId,
          createdBy: req.user?._id,
        });
      }

      app.status = "approved";
      app.approvedAt = new Date();
      app.approvedBy = req.user?._id;
      app.currentStage = "COMPLETED";
      app.approvalHistory = app.approvalHistory || [];
      app.approvalHistory.push({
        stage: app.currentStage || "COMPLETED",
        approver: req.user?._id,
        status: "approved",
        remarks: decisionReason || "Approved",
        actionDate: new Date(),
      });
      await app.save({ validateBeforeSave: false });

      try {
        await sendVendorApprovalEmail({
          to: user.email,
          vendorName: user.name,
          temporaryPassword: generatedPassword,
        });
      } catch (emailErr) {
        console.error("Email failed:", emailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Submission approved. Vendor account created and credentials sent via email.",
        data: app,
        mockEmail: {
          to: user.email,
          subject: "Vendor Account Approved",
          credentials: { email: user.email, password: generatedPassword },
          loginLink: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"}/login`,
        },
      });
    }

    const actionableTreeStatuses = ["pending", "needs_correction", "on_hold", "escalated", "conditionally_approved"];
    if (!actionableTreeStatuses.includes(submission.status)) {
      return res.status(400).json({ success: false, message: `Submission already ${submission.status}.` });
    }

    const previousStatus = submission.status;
    const nextStatus = DECISION_STATUS_MAP[normalizedAction];

    if (riskLevel && ["low", "medium", "high"].includes(String(riskLevel).toLowerCase())) {
      submission.riskLevel = String(riskLevel).toLowerCase();
    }
    if (riskScore !== undefined && riskScore !== null && !Number.isNaN(Number(riskScore))) {
      submission.riskScore = Math.max(0, Math.min(100, Number(riskScore)));
    }

    if (normalizedAction !== "approve") {
      submission.status = nextStatus;
      submission.reviewedBy = req.user?._id;
      submission.reviewedAt = new Date();
      submission.decisionReason = decisionReason;
      if (normalizedAction === "reject") {
        submission.rejectionReason = decisionReason || "Rejected by admin";
      } else {
        submission.rejectionReason = "";
      }
      if (normalizedAction === "send_back") {
        submission.correctionCount = Number(submission.correctionCount || 0) + 1;
      }
      submission.decisionHistory = submission.decisionHistory || [];
      submission.decisionHistory.push({
        action: normalizedAction,
        fromStatus: previousStatus,
        toStatus: nextStatus,
        reason: decisionReason,
        reviewerId: req.user?._id,
        reviewerRole: req.user?.role || "",
        createdAt: new Date(),
      });
      await submission.save();
      return res.status(200).json({
        success: true,
        data: submission,
        message: `Submission moved to ${nextStatus}.`,
      });
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
        tenantId: req.user?.tenantId,
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
      user.tenantId = req.user?.tenantId;
      await user.save();
    }

    const Vendor = require("../models/vendor.model");
    let vendor = await Vendor.findOne({ email: submission.vendorEmail, tenantId: req.user.tenantId });
    if (!vendor) {
      const getVal = (label) => submission.data.find(d =>
        d.label?.toLowerCase().includes(label.toLowerCase()) ||
        d.fieldId?.toLowerCase().includes(label.toLowerCase())
      )?.value || "";

      vendor = await Vendor.create({
        name: submission.vendorName || "Active Partner",
        email: submission.vendorEmail,
        companyName: submission.vendorName,
        status: "active",
        phone: String(getVal("mobile") || getVal("phone") || "0000000000").replace(/[^0-9]/g, "").slice(0, 10) || "0000000000",
        category: submission.formId,
        address: {
          city: getVal("city") || "N/A",
          state: getVal("state") || "N/A",
          pincode: getVal("pincode") || "000000",
        },
        tenantId: req.user.tenantId,
        createdBy: req.user?._id,
      });
    }

    submission.status = nextStatus;
    submission.rejectionReason = "";
    submission.decisionReason = decisionReason || "Approved";
    submission.vendorUserId = user._id;
    submission.reviewedBy = req.user?._id;
    submission.reviewedAt = new Date();
    submission.decisionHistory = submission.decisionHistory || [];
    submission.decisionHistory.push({
      action: normalizedAction,
      fromStatus: previousStatus,
      toStatus: nextStatus,
      reason: decisionReason || "Approved",
      reviewerId: req.user?._id,
      reviewerRole: req.user?.role || "",
      createdAt: new Date(),
    });
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

    const { lookupGstProfile } = require("../services/gstLookup.service");
    const profile = await lookupGstProfile(gstNumber.toUpperCase());

    return res.status(200).json({
      success: true,
      data: {
        gstNumber: profile.gstNumber,
        companyName: profile.autofill?.companyName || profile.legalName || profile.tradeName || "",
        address: profile.autofill?.address || {},
        state: profile.state || "",
        city: profile.principalAddress?.city || "",
        pincode: profile.principalAddress?.pincode || ""
      },
      source: profile.source,
      provider: profile.provider,
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
