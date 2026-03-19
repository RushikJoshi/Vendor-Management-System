const express = require("express");
const router = express.Router();
const { getVendorStats } = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Protect all dashboard routes - Admin only
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/vendor-stats", getVendorStats);

module.exports = router;
