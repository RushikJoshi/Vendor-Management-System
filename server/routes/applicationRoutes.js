const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const upload = require("../middleware/upload");
const {
    submitApplication,
    getApplications,
    getApplicationById,
    processApprovalStage,
    finalizeSubmission,
    getApplicationState,
    checkEmail,
    approveApplication,
    rejectApplication
} = require("../controllers/applicationController");

// Public
router.post("/submit", upload.any(), submitApplication);
router.post("/:id/finalize", finalizeSubmission);
router.get("/state/:email", getApplicationState);
router.get("/check-email", checkEmail);

const { authorizeRoles } = require("../middlewares/role.middleware");

// Admin / Reviewers / HR
router.use(protect);
router.get("/", authorizeRoles("admin", "hr"), getApplications);
router.get("/:id", authorizeRoles("admin", "hr", "vendor"), getApplicationById);
router.patch("/:id/approve-stage", authorizeRoles("admin", "hr"), processApprovalStage);
router.post("/:id/approve", authorizeRoles("admin", "hr"), approveApplication);
router.post("/:id/reject", authorizeRoles("admin", "hr"), rejectApplication);


module.exports = router;
