const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const {
    getContracts,
    getContractStats,
    createContract,
    getVendorContracts,
    terminateContract,
    updateContract,
    deleteContract
} = require("../controllers/ContractController");

const { authorizeModules } = require("../middlewares/role.middleware");

router.use(protect);

router.get("/vendor/:vendorId", authorizeModules("contracts"), getVendorContracts);
router.get("/stats", authorizeModules("contracts"), getContractStats);
router.get("/", authorizeModules("contracts"), getContracts);
router.post("/", authorizeModules("contracts"), createContract);
router.patch("/:id", authorizeModules("contracts"), updateContract);
router.patch("/:id/terminate", authorizeModules("contracts"), terminateContract);
router.delete("/:id", authorizeModules("contracts"), deleteContract);


module.exports = router;
