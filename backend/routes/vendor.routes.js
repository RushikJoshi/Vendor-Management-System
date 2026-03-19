const express = require("express");
const router = express.Router();
const {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getVendorPerformance,
    uploadGST,
    uploadAgreement,
    getMe,
    updateMe,
    sendPaymentReminder
} = require("../controllers/vendor.controller");


const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { uploadGST: uploadGSTMiddleware, uploadAgreement: uploadAgreementMiddleware } = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const { createVendor: createSchema, updateVendor: updateSchema } = require("../validations/vendor.validation");

// 1) All routes are protected by JWT
router.use(protect);

// 2) File Upload Routes (Admin/HR only)
router.put(
    "/:id/upload-gst",
    authorizeRoles("admin", "hr"),
    uploadGSTMiddleware.single("gstCertificate"),
    uploadGST
);

router.put(
    "/:id/upload-agreement",
    authorizeRoles("admin", "hr"),
    uploadAgreementMiddleware.single("agreementFile"),
    uploadAgreement
);

// RBAC
router.get("/me", authorizeRoles("vendor", "admin", "hr", "manager"), getMe);
router.put("/me", authorizeRoles("vendor"), updateMe);


// Admin + HR can create, update, or delete

// Manager can view
// Vendor should only access their own data (usually handled in controller or via profile route)

router
    .route("/")
    .post(authorizeRoles("admin", "hr"), validate(createSchema), createVendor)
    .get(authorizeRoles("admin", "hr", "manager"), getAllVendors);

router
    .route("/:id")
    .get(authorizeRoles("admin", "hr", "manager", "vendor"), getVendorById)
    .patch(authorizeRoles("admin", "hr"), validate(updateSchema), updateVendor)
    .delete(authorizeRoles("admin", "hr"), deleteVendor);

router.get("/:id/performance", authorizeRoles("admin", "hr", "manager"), getVendorPerformance);
router.post("/:id/remind-payment", authorizeRoles("admin", "hr"), sendPaymentReminder);


module.exports = router;
