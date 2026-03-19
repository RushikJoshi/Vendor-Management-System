const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const { checkPermission } = require("../middleware/permissionMiddleware");
const {
    getContracts,
    getContractStats,
    createContract,
    getVendorContracts,
    terminateContract,
    updateContract,
    deleteContract
} = require("../controllers/ContractController");

const { authorizeRoles } = require("../middlewares/role.middleware");

// Vendor endpoints 
router.get("/vendor/:vendorId", protect, authorizeRoles("admin", "manager", "vendor"), getVendorContracts);

// Admin / Manager endpoints
router.use(protect);

router.get("/stats", authorizeRoles("admin", "manager"), getContractStats);
router.get("/", authorizeRoles("admin", "manager"), getContracts);
router.post("/", authorizeRoles("admin", "manager"), createContract);
router.patch("/:id", authorizeRoles("admin", "manager"), updateContract);
router.patch("/:id/terminate", authorizeRoles("admin", "manager"), terminateContract);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteContract);


module.exports = router;
