const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const {
    getStats,
    getMessages,
    getVendors,
    updateVendorStatus,
    deleteVendor,
    sendInquiry,
    getAuditLogs,
    exportVendors,
    importVendors
} = require("../controllers/adminController");
const { getAnalytics } = require("../controllers/analyticsController");
const upload = require("../middleware/upload");

router.use(protect);
// General admin access for basic stats/messages
router.get("/stats", checkPermission("APPLICATION_VIEW_BASIC"), getStats);
router.get("/messages", checkPermission("APPLICATION_VIEW_BASIC"), getMessages);
router.get("/vendors", checkPermission("MANAGE_VENDORS"), getVendors);
router.get("/vendors/export", checkPermission("MANAGE_VENDORS"), exportVendors);
router.post("/vendors/import", checkPermission("MANAGE_VENDORS"), upload.any(), importVendors);
router.patch("/vendors/:id/status", checkPermission("MANAGE_VENDORS"), updateVendorStatus);
router.delete("/vendors/:id", checkPermission("BLACKLIST_VENDOR"), deleteVendor);
router.post("/inquiry", getPCheck("MANAGE_VENDORS"), sendInquiry);
router.get("/audit-logs", checkPermission("VIEW_AUDIT_LOGS"), getAuditLogs);
router.get("/analytics", checkPermission("APPLICATION_VIEW_BASIC"), getAnalytics);

function getPCheck(p) { return checkPermission(p); }

module.exports = router;
