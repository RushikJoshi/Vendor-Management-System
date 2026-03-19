const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const { checkPermission } = require("../middleware/permissionMiddleware");
const ContractController = require("../controllers/ContractController");
const PerformanceController = require("../controllers/PerformanceController");
const LifecycleService = require("../services/LifecycleService");

// All SLM routes require protection
router.use(protect);

/**
 * CONTRACT ROUTES
 */
router.get("/contracts/stats", checkPermission("MANAGE_CONTRACTS"), ContractController.getContractStats);
router.get("/contracts", checkPermission("MANAGE_CONTRACTS"), ContractController.getContracts);
router.post("/contracts", checkPermission("MANAGE_CONTRACTS"), ContractController.createContract);
router.get("/contracts/vendor/:vendorId", checkPermission("MANAGE_VENDORS"), ContractController.getVendorContracts);
router.patch("/contracts/:id", checkPermission("MANAGE_CONTRACTS"), ContractController.updateContract);
router.patch("/contracts/:id/terminate", checkPermission("MANAGE_CONTRACTS"), ContractController.terminateContract);
router.delete("/contracts/:id", checkPermission("MANAGE_CONTRACTS"), ContractController.deleteContract);

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
