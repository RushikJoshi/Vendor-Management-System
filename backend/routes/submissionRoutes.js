const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  getSubmissions,
  getSubmissionById,
  reviewSubmission,
  getVendorDashboard,
} = require("../controllers/submissionController");

router.use(protect);

router.get("/vendor/dashboard", authorizeRoles("vendor"), getVendorDashboard);
router.get("/", authorizeRoles("admin"), getSubmissions);
router.get("/:id", authorizeRoles("admin"), getSubmissionById);
router.patch("/:id/review", authorizeRoles("admin"), reviewSubmission);

module.exports = router;
