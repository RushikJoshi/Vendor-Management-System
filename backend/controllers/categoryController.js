const Category = require("../models/Category");
const FormTemplate = require("../models/FormTemplate");
const VendorApplication = require("../models/VendorApplication");
const EligibilityService = require("../services/EligibilityService");
const AuditService = require("../services/AuditService");

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        await AuditService.logCreate(req, "Category", category);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getPublicCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId).populate("formTemplate");
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        if (!category.isActive) return res.status(403).json({ success: false, message: "Category is not active" });
        if (!category.formTemplate) return res.status(404).json({ success: false, message: "No active form template assigned to this category" });

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate("formTemplate");
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const beforeData = category.toObject();
        category.set(req.body);
        await category.save();

        const afterData = category.toObject();
        await AuditService.logUpdate(req, "Category", category._id, beforeData, afterData);

        // If criteria was updated, recalculate scores for all applications in this category
        if (req.body.criteria) {
            const applications = await VendorApplication.find({ category: category._id });
            for (const app of applications) {
                await EligibilityService.calculateScore(app, category);
            }
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            const beforeData = category.toObject();
            await Category.findByIdAndDelete(req.params.id);
            await AuditService.log({
                req,
                actionType: "RECORD_DELETED",
                entityType: "Category",
                entityId: category._id,
                beforeData
            });
        }
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
