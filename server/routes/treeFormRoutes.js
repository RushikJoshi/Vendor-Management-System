const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles, authorizeModules } = require("../middlewares/role.middleware");
const {
  createForm,
  createDefaultForm,
  updateForm,
  getFormById,
  getForms,
  submitForm,
  gstAutofill,
  ifscAutofill,
} = require("../controllers/treeFormController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "tree-submissions");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/create", protect, authorizeRoles("admin"), authorizeModules("vendor_forms"), createForm);
router.post("/create-default", protect, authorizeRoles("admin"), authorizeModules("vendor_forms"), createDefaultForm);
router.put("/:id", protect, authorizeRoles("admin"), authorizeModules("vendor_forms"), updateForm);
router.get("/all", protect, authorizeRoles("admin"), authorizeModules("vendor_forms"), getForms);
router.post("/submit", upload.any(), submitForm);
router.post("/autofill/gst", gstAutofill);
router.post("/autofill/ifsc", ifscAutofill);
router.get("/:id", getFormById);

module.exports = router;
