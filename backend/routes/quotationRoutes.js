const express = require("express");
const router = express.Router();
const {
    submitQuotation,
    getQuotationsByRFQ
} = require("../controllers/quotationController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");
const { checkActionAccess, checkAnyActionAccess } = require("../middlewares/permission.middleware");

router.use(protect);
router.use(restrictToTenant);

router.post("/", checkActionAccess("vendor_quote_submit"), submitQuotation);
router.get("/rfq/:rfqId", checkAnyActionAccess("rfq_view", "vendor_quote_submit"), getQuotationsByRFQ);

module.exports = router;
