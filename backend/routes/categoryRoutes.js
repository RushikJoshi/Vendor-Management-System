const express = require("express");
const router = express.Router();
const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// ── Public Routes (no auth needed) ──────────────────
router.get("/public/:categoryId", require("../controllers/categoryController").getPublicCategory);

// Public list of ACTIVE categories for vendor registration page
router.get("/public-list", async (req, res) => {
    try {
        const Category = require("../models/Category");
        const categories = await Category.find({ isActive: true })
            .select("name code slug description isActive approvalType formTemplate")
            .populate("formTemplate", "name status categoryId");

        const enriched = categories.map(cat => {
            const obj = cat.toObject();
            const ft = cat.formTemplate;

            // hasPublishedForm = true ONLY if:
            // 1. formTemplate exists and is published
            // 2. formTemplate.categoryId matches this category (OWN form, not shared)
            const formCatId = ft?.categoryId?.toString();
            const catId = cat._id.toString();
            const isOwnPublishedForm = ft && ft.status === "published" && formCatId === catId;

            obj.hasPublishedForm = isOwnPublishedForm;
            return obj;
        });

        res.status(200).json({ success: true, data: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Protected Routes (auth required) ────────────────
router.use(protect);

router
    .route("/")
    .get(getCategories)
    .post(checkPermission("MANAGE_CATEGORIES"), createCategory);

router
    .route("/:id")
    .put(checkPermission("MANAGE_CATEGORIES"), updateCategory)
    .delete(checkPermission("MANAGE_CATEGORIES"), deleteCategory);

module.exports = router;

