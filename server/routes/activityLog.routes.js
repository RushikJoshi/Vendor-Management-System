const express = require("express");
const router = express.Router();
const { getActivityLogs } = require("../controllers/activityLog.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// All routes are protected and only for Admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getActivityLogs);

module.exports = router;
