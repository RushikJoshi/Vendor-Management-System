const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles, authorizeModules } = require("../middlewares/role.middleware");
const {
  getSubmissions,
  getSubmissionById,
  approveSubmission,
} = require("../controllers/treeFormController");

router.get("/all", protect, authorizeRoles("admin", "hr"), authorizeModules("submissions"), getSubmissions);
router.get("/:id", protect, authorizeRoles("admin", "hr"), authorizeModules("submissions"), getSubmissionById);
router.post("/approve", protect, authorizeRoles("admin"), authorizeModules("submissions"), approveSubmission);

module.exports = router;
