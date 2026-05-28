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
    getVendorDashboardStats,
    updateMe,
    sendPaymentReminder,
    lookupGstProfile,
    blacklistVendor
} = require("../controllers/vendor.controller");


const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { checkActionAccess, checkAnyActionAccess } = require("../middlewares/permission.middleware");
const { uploadGST: uploadGSTMiddleware, uploadAgreement: uploadAgreementMiddleware } = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const { createVendor: createSchema, updateVendor: updateSchema } = require("../validations/vendor.validation");

// 1) All routes are protected by JWT
router.use(protect);

router.get(
    "/gst-profile/:gstNumber",
    authorizeRoles("admin", "hr"),
    checkAnyActionAccess("vendors_add", "vendors_edit", "vendors_view"),
    lookupGstProfile
);

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
router.get("/me", checkAnyActionAccess("vendor_dashboard", "vendors_view"), getMe);
router.get("/me/stats", checkAnyActionAccess("vendor_dashboard"), getVendorDashboardStats);
router.put("/me", authorizeRoles("vendor"), checkActionAccess("vendor_dashboard"), updateMe);


// Admin + HR can create, update, or delete

// Manager can view
// Vendor should only access their own data (usually handled in controller or via profile route)

router
    .route("/")
    .post(authorizeRoles("admin", "hr"), checkActionAccess("vendors_add"), validate(createSchema), createVendor)
    .get(authorizeRoles("admin", "hr", "manager"), checkActionAccess("vendors_view"), getAllVendors);

router
    .route("/:id")
    .get(authorizeRoles("admin", "hr", "manager", "vendor"), checkAnyActionAccess("vendors_view", "vendor_dashboard"), getVendorById)
    .patch(authorizeRoles("admin", "hr"), checkActionAccess("vendors_edit"), validate(updateSchema), updateVendor)
    .delete(authorizeRoles("admin", "hr"), checkActionAccess("vendors_edit"), deleteVendor);

router.post("/:id/blacklist", authorizeRoles("admin", "hr"), checkActionAccess("vendors_edit"), blacklistVendor);
router.get("/:id/performance", authorizeRoles("admin", "hr", "manager"), getVendorPerformance);
router.post("/:id/remind-payment", authorizeRoles("admin", "hr"), sendPaymentReminder);


module.exports = router;
