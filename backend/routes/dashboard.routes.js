const express = require("express");
const router = express.Router();
const { getVendorStats } = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles, authorizeModules } = require("../middlewares/role.middleware");

// Protect all dashboard routes - Internal roles
router.use(protect);
router.use(authorizeRoles("admin", "hr", "sales"));
router.use(authorizeModules("dashboard"));

router.get("/vendor-stats", getVendorStats);

module.exports = router;
