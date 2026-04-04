const FormTemplate = require("../models/FormTemplate");
const AuditLog = require("../models/AuditLog");
const Category = require("../models/Category");
const TreeForm = require("../models/TreeForm");

exports.getPublishedForm = async (req, res) => {
    try {
        const templates = await FormTemplate.find({ status: "published" }).sort("createdAt");
        res.status(200).json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMasterForm = async (req, res) => {
    try {
        const treeForm = await TreeForm.findOne({ code: "DEFAULT_VENDOR_REGISTRATION_V1", status: "published" });
        if (!treeForm) {
            return res.status(404).json({ success: false, message: "Master form not found or not published" });
        }

        const sections = [];
        let orderCount = 1;

        const processNode = (node) => {
            if (node.fields && node.fields.length > 0) {
                sections.push({
                    sectionTitle: node.title || `Section ${orderCount}`,
                    order: orderCount++,
                    fields: node.fields.map((f, i) => ({
                        fieldId: f.id,
                        label: f.label || `Field ${i+1}`,
                        type: f.type || "text",
                        required: !!f.required,
                        options: f.options || [],
                        order: i + 1,
                        validation: f.validation
                    }))
                });
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(c => processNode(c));
            }
        };

        if (treeForm.structure && Array.isArray(treeForm.structure)) {
            treeForm.structure.forEach(node => processNode(node));
        }

        res.status(200).json({ 
            success: true, 
            data: {
                _id: treeForm._id,
                name: treeForm.name,
                description: treeForm.description,
                sections: sections
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTemplates = async (req, res) => {
    try {
        const templates = await FormTemplate.find({ status: { $ne: "archived" } }).sort("-createdAt");
        res.status(200).json({ success: true, data: templates });
    } catch (err) {
        console.error("GET_TEMPLATES_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getFormById = async (req, res) => {
    try {
        const treeForm = await TreeForm.findById(req.params.id);
        if (treeForm) {
            const sections = [];
            let orderCount = 1;
            const processNode = (node) => {
                if (node.fields && node.fields.length > 0) {
                    sections.push({
                        sectionTitle: node.title || `Section ${orderCount}`,
                        order: orderCount++,
                        fields: node.fields.map((f, i) => ({
                            fieldId: f.id,
                            label: f.label || `Field ${i+1}`,
                            type: f.type || "text",
                            required: !!f.required,
                            options: f.options || [],
                            order: i + 1,
                            validation: f.validation
                        }))
                    });
                }
                if (node.children && node.children.length > 0) {
                    node.children.forEach(c => processNode(c));
                }
            };
            if (treeForm.structure && Array.isArray(treeForm.structure)) {
                treeForm.structure.forEach(node => processNode(node));
            }
            return res.status(200).json({ 
                success: true, 
                data: {
                    _id: treeForm._id,
                    name: treeForm.name,
                    description: treeForm.description,
                    sections: sections
                } 
            });
        }

        const template = await FormTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPublicFormByCategory = async (req, res) => {
    try {
        const catId = req.params.categoryId;
        
        let categoryName = "";
        try {
            const cat = await Category.findById(catId);
            if (cat) categoryName = cat.name;
        } catch (e) {}

        let treeForm = null;
        if (categoryName) {
            treeForm = await TreeForm.findOne({ categoryName, status: "published" });
        }
        if (!treeForm) {
            treeForm = await TreeForm.findOne({ code: "DEFAULT_VENDOR_REGISTRATION_V1", status: "published" });
        }

        if (treeForm) {
            const sections = [];
            let orderCount = 1;
            const processNode = (node) => {
                if (node.fields && node.fields.length > 0) {
                    sections.push({
                        sectionTitle: node.title || `Section ${orderCount}`,
                        order: orderCount++,
                        fields: node.fields.map((f, i) => ({
                            fieldId: f.id,
                            label: f.label || `Field ${i+1}`,
                            type: f.type || "text",
                            required: !!f.required,
                            options: f.options || [],
                            order: i + 1,
                            validation: f.validation
                        }))
                    });
                }
                if (node.children && node.children.length > 0) {
                    node.children.forEach(c => processNode(c));
                }
            };
            if (treeForm.structure && Array.isArray(treeForm.structure)) {
                treeForm.structure.forEach(node => processNode(node));
            }
            return res.status(200).json({ 
                success: true, 
                data: {
                    _id: treeForm._id,
                    name: treeForm.name,
                    description: treeForm.description,
                    sections: sections
                } 
            });
        }

        // Find published form linked to this category
        const template = await FormTemplate.findOne({
            categoryId: catId,
            status: "published"
        });
        
        // Return 200 with null if not found
        return res.status(200).json({ success: true, data: template || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.saveForm = async (req, res) => {
    const { name, title, description, categoryId, categoryName, sections, status } = req.body;
    let template;

    const formName = name || title;

    if (!formName || !sections) {
        return res.status(400).json({ success: false, message: "Name and sections are required" });
    }

    try {
        let finalCategoryId = categoryId;

        // Create category on the fly if categoryName is provided
        if (!finalCategoryId && categoryName) {
            let cat = await Category.findOne({ name: categoryName });
            if (!cat) {
                cat = await Category.create({ 
                    name: categoryName, 
                    description: `Automatically created for ${formName}` 
                });
            }
            finalCategoryId = cat._id;
        }

        if (!finalCategoryId) {
            return res.status(400).json({ success: false, message: "Category ID or name is required" });
        }

        if (req.body._id) {
            const oldForm = await FormTemplate.findById(req.body._id);
            template = await FormTemplate.findByIdAndUpdate(req.body._id, {
                name: formName,
                description,
                categoryId: finalCategoryId,
                sections,
                status: status || "draft",
                version: (oldForm?.version || 1) + 1
            }, { new: true });
        } else {
            template = await FormTemplate.create({
                name: formName,
                description,
                categoryId: finalCategoryId,
                sections,
                status: status || "draft",
                createdBy: req.user?._id
            });
        }

        res.status(200).json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.publishForm = async (req, res) => {
    try {
        const { id } = req.params;
        const templateToPublish = await FormTemplate.findById(id);

        if (!templateToPublish) {
            return res.status(404).json({ success: false, message: "Form not found" });
        }

        // Only one Published form allowed per category
        if (templateToPublish.categoryId) {
            await FormTemplate.updateMany(
                { categoryId: templateToPublish.categoryId, _id: { $ne: id }, status: "published" },
                { status: "archived" }
            );
        }

        const template = await FormTemplate.findByIdAndUpdate(id, {
            status: "published",
            publishedAt: Date.now()
        }, { new: true });

        // Audit Log
        if (req.user) {
            await AuditLog.create({
                userId: req.user._id,
                userRole: req.user.roleName || "Admin",
                actionType: "PUBLISH_FORM",
                entityType: "FormTemplate",
                entityId: template._id,
                afterData: { status: "published" }
            });
        }

        res.status(200).json({ success: true, message: "Form published successfully", data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.archiveForm = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await FormTemplate.findByIdAndUpdate(id, { status: "archived" }, { new: true });

        if (!template) {
            return res.status(404).json({ success: false, message: "Form not found" });
        }

        // Audit Log
        if (req.user) {
            await AuditLog.create({
                userId: req.user._id,
                userRole: req.user.roleName || "Admin",
                actionType: "ARCHIVE_FORM",
                entityType: "FormTemplate",
                entityId: template._id,
                afterData: { status: "archived" }
            });
        }

        res.status(200).json({ success: true, message: "Form archived successfully", data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.initEnterpriseTemplates = async (req, res) => {
    // Keep backwards compatibility for initial seeding or update to new status
    const existingS1 = await FormTemplate.findOne({ name: "STAGE 1 — NEFT / RTGS BANK REGISTRATION" });
    const existingS2 = await FormTemplate.findOne({ name: "STAGE 2 — FULL VENDOR REGISTRATION MASTER FORM" });

    if (existingS1 && existingS2) {
        return res.status(200).json({ success: true, message: "Enterprise templates already initialized", data: [existingS1, existingS2] });
    }

    // (Simplified block to keep it clean. Recreate if missing)
    let stage1 = existingS1;
    if (!existingS1) {
        stage1 = await FormTemplate.create({
            name: "STAGE 1 — NEFT / RTGS BANK REGISTRATION",
            status: "Published",
            publishedAt: Date.now(),
            sections: [
                {
                    title: "Vendor & Location Details",
                    fields: [
                        { label: "Vendor Name", name: "vendorName", type: "text", required: true },
                        { label: "City", name: "city", type: "text", required: true },
                    ]
                }
            ]
        });
    }

    let stage2 = existingS2;
    if (!existingS2) {
        stage2 = await FormTemplate.create({
            name: "STAGE 2 — FULL VENDOR REGISTRATION MASTER FORM",
            status: "Published",
            publishedAt: Date.now(),
            sections: [
                {
                    title: "SECTION A — Vendor Identification",
                    fields: [
                        { label: "Vendor Account Number", name: "vendorAccNum", type: "text", required: true },
                        { label: "Vendor Name", name: "vendorName", type: "text", required: true },
                    ]
                }
            ]
        });
    }

    res.status(201).json({ success: true, message: "Enterprise templates initialized", data: [stage1, stage2] });
};
