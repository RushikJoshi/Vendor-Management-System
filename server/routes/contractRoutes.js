const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");

const {
    getContracts,
    getContractStats,
    createContract,
    getVendorContracts,
    terminateContract,
    updateContract,
    deleteContract,
    getContractById
} = require("../controllers/ContractController");

const { checkActionAccess } = require("../middlewares/permission.middleware");

router.use(protect);

router.get("/vendor/:vendorId", checkActionAccess("contracts_view"), getVendorContracts);
router.get("/stats", checkActionAccess("contracts_view"), getContractStats);
router.get("/:id", checkActionAccess("contracts_view"), getContractById);
router.get("/", checkActionAccess("contracts_view"), getContracts);
router.post("/", checkActionAccess("contracts_manage"), createContract);
router.patch("/:id", checkActionAccess("contracts_manage"), updateContract);
router.patch("/:id/terminate", checkActionAccess("contracts_manage"), terminateContract);
router.delete("/:id", checkActionAccess("contracts_manage"), deleteContract);


module.exports = router;
