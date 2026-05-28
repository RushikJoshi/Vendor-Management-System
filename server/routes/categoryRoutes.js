const express = require("express");
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// ── Public Routes (For registration page) ─────────────
router.get("/public-list", async (req, res) => {
    try {
        const Category = require("../models/Category");
        const FormTemplate = require("../models/FormTemplate");
        
        // Only show active categories
        const categories = await Category.find({ status: "active" }).sort({ name: 1 });
        
        // Enrich with information if a form exists (for registration button state)
        const enriched = await Promise.all(categories.map(async (cat) => {
            const form = await FormTemplate.findOne({ categoryId: cat._id, status: "published" });
            const obj = cat.toObject();
            obj.hasPublishedForm = !!form;
            return obj;
        }));

        res.status(200).json({ success: true, data: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Protected Admin Routes ───────────────────────────
router.use(protect);

router.route("/")
    .get(authorizeRoles("admin", "hr", "procurement", "manager"), getCategories)
    .post(authorizeRoles("admin", "hr", "procurement"), createCategory);

router.route("/:id")
    .get(authorizeRoles("admin", "hr", "procurement", "manager"), getCategoryById)
    .put(authorizeRoles("admin", "hr", "procurement"), updateCategory)
    .delete(authorizeRoles("admin", "hr"), deleteCategory);

module.exports = router;

