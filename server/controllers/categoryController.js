const Category = require("../models/Category");
const AuditService = require("../services/AuditService");

// Create Category (Admin Only)
exports.createCategory = async (req, res) => {
    try {
        const { name, description, status, criteria } = req.body;
        const category = await Category.create({ name, description, status, criteria });
        await AuditService.logCreate(req, "Category", category);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Categories (Master Module)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get Single Category for Public/Vendor (By ID)
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const beforeData = category.toObject();
        category.set(req.body);
        await category.save();

        const afterData = category.toObject();
        await AuditService.logUpdate(req, "Category", category._id, beforeData, afterData);

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Category
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
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
