const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const { checkPermission } = require("../middleware/permissionMiddleware");
const { 
    getContractStats, getContracts, createContract, getVendorContracts, updateContract, terminateContract, deleteContract, getContractById 
} = require("../controllers/ContractController");
const PerformanceController = require("../controllers/PerformanceController");
const LifecycleService = require("../services/LifecycleService");

// All SLM routes require protection
router.use(protect);

// Custom middleware to allow vendors or users with MANAGE_CONTRACTS
const allowVendorOrPermission = (permission) => {
    const authCheck = checkPermission(permission);
    return (req, res, next) => {
        if (req.user && req.user.role === 'vendor') {
            return next();
        }
        return authCheck(req, res, next);
    };
};

/**
 * CONTRACT ROUTES
 */
router.get("/contracts/stats", allowVendorOrPermission("MANAGE_CONTRACTS"), getContractStats);
router.get("/contracts", allowVendorOrPermission("MANAGE_CONTRACTS"), getContracts);
router.get("/contracts/:id", allowVendorOrPermission("MANAGE_CONTRACTS"), getContractById);
router.post("/contracts", checkPermission("MANAGE_CONTRACTS"), createContract);
router.get("/contracts/vendor/:vendorId", checkPermission("MANAGE_VENDORS"), getVendorContracts);
router.patch("/contracts/:id", checkPermission("MANAGE_CONTRACTS"), updateContract);
router.patch("/contracts/:id/terminate", checkPermission("MANAGE_CONTRACTS"), terminateContract);
router.delete("/contracts/:id", checkPermission("MANAGE_CONTRACTS"), deleteContract);

/**
 * PERFORMANCE ROUTES
 */
router.post("/performance/review", checkPermission("MANAGE_VENDORS"), PerformanceController.submitReview);
router.get("/performance/vendor/:vendorId", checkPermission("MANAGE_VENDORS"), PerformanceController.getVendorPerformance);

/**
 * LIFECYCLE STATE ROUTES
 */
router.patch("/vendors/:id/lifecycle", checkPermission("MANAGE_VENDORS"), async (req, res) => {
    try {
        const { status, reason, remarks } = req.body;
        const vendor = await LifecycleService.transitionStatus(req, req.params.id, status, reason, remarks);
        res.json({ success: true, data: vendor });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
