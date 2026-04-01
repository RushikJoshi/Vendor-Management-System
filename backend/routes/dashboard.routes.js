const express = require("express");
const router = express.Router();
const { getVendorStats } = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");
const { checkActionAccess } = require("../middlewares/permission.middleware");

// Protect all dashboard routes - Internal roles
router.use(protect);
router.use(checkActionAccess("dashboard_view"));

router.get("/vendor-stats", getVendorStats);

module.exports = router;
