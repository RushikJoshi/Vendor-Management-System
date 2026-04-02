const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { protect } = require("../middlewares/auth.middleware");
const {
    createForm,
    updateForm,
    getForms,
    getFormById: getVrsFormById,
    publishForm: publishVrsForm,
    unpublishForm,
    copyForm,
    getFormPreview,
    getPublicForm,
    submitPublicForm,
} = require("../controllers/vrsFormController");

const {
    getPublishedForm,
    getFormById: getLegacyFormById,
    saveForm,
    publishForm,
    archiveForm,
    initEnterpriseTemplates,
    getTemplates,
    getPublicFormByCategory,
    getMasterForm
} = require("../controllers/formController");

const { authorizeRoles } = require("../middlewares/role.middleware");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "..", "uploads", "submissions");
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
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".xlsx"];
        if (!allowed.includes(ext)) {
            return cb(new Error("Invalid file type."));
        }
        cb(null, true);
    },
});

// Public
router.get("/master/public", getMasterForm);
router.get("/published", getPublishedForm);
router.get("/public/:categoryId", getPublicFormByCategory);
router.get("/single/public/:id", getLegacyFormById);
router.get("/:formId/public", getPublicForm);
router.post("/:formId/submit", upload.any(), submitPublicForm);

// Protected Admin Routes 
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getTemplates);
router.get("/templates", getTemplates);
router.post("/", saveForm);
router.post("/builder", createForm);
router.get("/builder/all", getForms);
router.get("/builder/:formId", getVrsFormById);
router.put("/builder/:formId", updateForm);
router.post("/builder/:formId/publish", publishVrsForm);
router.post("/builder/:formId/unpublish", unpublishForm);
router.post("/builder/:formId/copy", copyForm);
router.get("/builder/:formId/preview", getFormPreview);
router.post("/:id/publish", publishForm);
router.patch("/:id/publish", publishForm);
router.patch("/:id/archive", archiveForm);
router.post("/seed/enterprise", initEnterpriseTemplates);


// Public (Parameterized - MUST BE LAST)
router.get("/:id", getLegacyFormById);

module.exports = router;
