const path = require("path");
const Category = require("../models/Category");
const Form = require("../models/Form");
const Submission = require("../models/Submission");

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const deriveCategoryName = (formName) => {
  let base = (formName || "")
    .replace(/registration|onboarding|form/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!base) return "General Vendors";
  base = base.replace(/vendors?/i, "").trim();
  return `${toTitleCase(base)} Vendors`;
};

const ensureCategory = async (categoryName, formName) => {
  const finalName = categoryName?.trim() || deriveCategoryName(formName);
  let category = await Category.findOne({ name: finalName });

  if (!category) {
    category = await Category.create({
      name: finalName,
      description: `Auto-created from form: ${formName}`,
    });
  }

  return category;
};

const normalizeSections = (sections = [], fields = []) => {
  if (Array.isArray(sections) && sections.length) {
    return sections.map((section, index) => ({
      key: slugify(section.key || section.title || `section-${index + 1}`),
      title: section.title || section.key || `Section ${index + 1}`,
      order: Number.isInteger(section.order) ? section.order : index,
    }));
  }

  const dedup = [...new Set(fields.map((f) => f.section || "General Information"))];
  return dedup.map((title, index) => ({ key: slugify(title), title, order: index }));
};

const normalizeFields = (fields = []) =>
  fields.map((field, index) => ({
    fieldId: field.fieldId || `field_${Date.now()}_${index + 1}`,
    label: field.label?.trim() || `Field ${index + 1}`,
    type: field.type || "text",
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    placeholder: field.placeholder || "",
    section: field.section || "General Information",
    validation: {
      pattern: field.validation?.pattern || "none",
      min: field.validation?.min,
      max: field.validation?.max,
      allowedFileTypes: Array.isArray(field.validation?.allowedFileTypes)
        ? field.validation.allowedFileTypes
        : [],
      maxFileSizeMB: Number(field.validation?.maxFileSizeMB || 5),
    },
    order: Number.isInteger(field.order) ? field.order : index,
  }));

const validateResponseByField = (field, answer, uploadedFile) => {
  if (field.required) {
    if (field.type === "file" && !uploadedFile) {
      return `Missing required file: ${field.label}`;
    }
    if (field.type !== "file") {
      const empty =
        answer === null ||
        answer === undefined ||
        (Array.isArray(answer) ? answer.length === 0 : String(answer).trim() === "");
      if (empty) return `Missing required field: ${field.label}`;
    }
  }

  if (!answer && field.type !== "file") return null;

  if (field.type === "email") {
    const email = String(answer || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return `Invalid email format in ${field.label}`;
    }
  }

  if (field.type === "number") {
    const n = Number(answer);
    if (Number.isNaN(n)) return `Invalid number in ${field.label}`;
    if (field.validation?.min !== undefined && n < field.validation.min) {
      return `${field.label} must be >= ${field.validation.min}`;
    }
    if (field.validation?.max !== undefined && n > field.validation.max) {
      return `${field.label} must be <= ${field.validation.max}`;
    }
  }

  if (field.validation?.pattern === "pan") {
    const pan = String(answer || "").trim().toUpperCase();
    if (pan && !PAN_REGEX.test(pan)) return `Invalid PAN format in ${field.label}`;
  }

  if (field.validation?.pattern === "gst") {
    const gst = String(answer || "").trim().toUpperCase();
    if (gst && !GST_REGEX.test(gst)) return `Invalid GST format in ${field.label}`;
  }

  if (field.type === "file" && uploadedFile) {
    const allowed = field.validation?.allowedFileTypes || [];
    const ext = path.extname(uploadedFile.originalname).replace(".", "").toLowerCase();
    if (allowed.length && !allowed.includes(ext)) {
      return `${field.label} allows only: ${allowed.join(", ")}`;
    }
    const maxBytes = Number(field.validation?.maxFileSizeMB || 5) * 1024 * 1024;
    if (uploadedFile.size > maxBytes) {
      return `${field.label} exceeds ${field.validation?.maxFileSizeMB || 5}MB size limit`;
    }
  }

  return null;
};

exports.createForm = async (req, res) => {
  try {
    const { name, description, fields = [], categoryName, status = "draft", sections = [] } = req.body;

    if (!name || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Form name and at least one field are required.",
      });
    }

    const category = await ensureCategory(categoryName, name);
    const publicSlug = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
    const normalizedFields = normalizeFields(fields);
    const normalizedSections = normalizeSections(sections, normalizedFields);

    const form = await Form.create({
      name,
      description,
      fields: normalizedFields,
      sections: normalizedSections,
      categoryName: category.name,
      categoryId: category._id,
      publicSlug,
      status,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Form created successfully.",
      data: {
        ...form.toObject(),
        publicUrl: `/form/${form._id}`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const existing = await Form.findById(formId);
    if (!existing) return res.status(404).json({ success: false, message: "Form not found." });

    const {
      name = existing.name,
      description = existing.description,
      fields = existing.fields,
      sections = existing.sections,
      categoryName,
      status = existing.status,
    } = req.body;

    const category = await ensureCategory(categoryName || existing.categoryName, name);
    const normalizedFields = normalizeFields(fields);
    const normalizedSections = normalizeSections(sections, normalizedFields);

    existing.name = name;
    existing.description = description;
    existing.fields = normalizedFields;
    existing.sections = normalizedSections;
    existing.status = status;
    existing.categoryName = category.name;
    existing.categoryId = category._id;
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Form updated successfully.",
      data: existing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: forms.map((form) => ({
        ...form.toObject(),
        publicUrl: `/form/${form._id}`,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFormById = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findByIdAndUpdate(formId, { status: "published" }, { new: true });
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });
    return res.status(200).json({ success: true, message: "Form published.", data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.unpublishForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findByIdAndUpdate(formId, { status: "draft" }, { new: true });
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });
    return res.status(200).json({ success: true, message: "Form moved to draft.", data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.copyForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });

    const cloned = await Form.create({
      name: `${form.name} (Copy)`,
      description: form.description,
      status: "draft",
      categoryName: form.categoryName,
      categoryId: form.categoryId,
      publicSlug: `${slugify(form.name)}-copy-${Math.random().toString(36).slice(2, 6)}`,
      sections: form.sections,
      fields: form.fields,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Form copied successfully.",
      data: cloned,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublicForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form || form.status !== "published") {
      return res.status(404).json({ success: false, message: "Form not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: form._id,
        name: form.name,
        description: form.description,
        categoryName: form.categoryName,
        sections: [...form.sections].sort((a, b) => a.order - b.order),
        fields: [...form.fields].sort((a, b) => a.order - b.order),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitPublicForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form || form.status !== "published") {
      return res.status(404).json({ success: false, message: "Form not found." });
    }

    const payload = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
    const rawResponses = payload?.responses || [];
    const files = req.files || [];

    const normalizedResponses = [];

    for (const field of form.fields) {
      const raw = rawResponses.find((r) => r.fieldId === field.fieldId) || {};
      const uploaded = files.find((f) => f.fieldname === `file_${field.fieldId}`);
      const isFile = field.type === "file";
      const answer = isFile ? null : raw.value ?? "";

      const validationError = validateResponseByField(field, answer, uploaded);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      normalizedResponses.push({
        fieldId: field.fieldId,
        label: field.label,
        type: field.type,
        section: field.section || "General Information",
        value: field.type === "multiselect" ? (Array.isArray(raw.value) ? raw.value : []) : answer,
        fileUrl: uploaded ? `/uploads/submissions/${path.basename(uploaded.path)}` : null,
        fileName: uploaded ? uploaded.originalname : null,
      });
    }

    const emailResponse = normalizedResponses.find((r) => r.type === "email");
    const vendorEmail = (emailResponse?.value || "").toString().trim().toLowerCase();
    const nameResponse = normalizedResponses.find((r) => /name/i.test(r.fieldId) || /name/i.test(r.label));

    const submission = await Submission.create({
      form: form._id,
      formName: form.name,
      categoryName: form.categoryName,
      vendorName: nameResponse?.value?.toString().trim() || "",
      vendorEmail,
      responses: normalizedResponses,
      formSnapshot: {
        sections: form.sections,
        fields: form.fields,
      },
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Form submitted successfully.",
      data: {
        submissionId: submission._id,
        status: submission.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFormPreview = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ success: false, message: "Form not found." });
    return res.status(200).json({
      success: true,
      data: {
        _id: form._id,
        name: form.name,
        description: form.description,
        status: form.status,
        categoryName: form.categoryName,
        sections: [...form.sections].sort((a, b) => a.order - b.order),
        fields: [...form.fields].sort((a, b) => a.order - b.order),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
