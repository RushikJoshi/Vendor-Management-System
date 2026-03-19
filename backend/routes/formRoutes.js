const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const {
    getPublishedForm,
    getFormById,
    saveForm,
    publishForm,
    archiveForm,
    initEnterpriseTemplates,
    getTemplates,
    getPublicFormByCategory,
    getMasterForm
} = require("../controllers/formController");

const { authorizeRoles } = require("../middlewares/role.middleware");

// Public
router.get("/master/public", getMasterForm);
router.get("/published", getPublishedForm);
router.get("/public/:categoryId", getPublicFormByCategory);

// Protected Admin Routes 
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getTemplates);
router.get("/templates", getTemplates);
router.post("/", saveForm);
router.post("/:id/publish", publishForm);
router.patch("/:id/publish", publishForm);
router.patch("/:id/archive", archiveForm);
router.post("/seed/enterprise", initEnterpriseTemplates);


// Public (Parameterized - MUST BE LAST)
router.get("/:id", getFormById);

module.exports = router;
