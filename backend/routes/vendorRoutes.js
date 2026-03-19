const router = require("express").Router();
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    registerVendor,
    getVendorMe,
    updateVendorProfile,
    getVendors,
    getVendorById,
    updateVendorStatus,
    blacklistVendor,
    deleteVendor,
} = require("../controllers/vendorController");

// Protected routes
router.use(protect);

// Admin Only: Create Vendor
router.post(
    "/register",
    authorize("admin"),
    upload.single("document"),
    registerVendor
);

// Admin Only: Delete Vendor
router.delete("/:id", authorize("admin"), deleteVendor);

// Admin Only: Manage Status & Blacklist
router.patch("/:id/status", authorize("admin"), updateVendorStatus);
router.post("/:id/blacklist", authorize("admin"), blacklistVendor);

// Both Admin and Normal Users can view vendors
router.get("/", authorize("admin", "user"), getVendors);
router.get("/:id", authorize("admin", "user"), getVendorById);

// Vendor Self-Service Routes (If vendors are also users, adjust as needed)
// For now, we follow the "Only admin can create or delete vendors. Normal users can view" rule.
router.get("/me", getVendorMe);
router.put("/me", updateVendorProfile);

module.exports = router;
