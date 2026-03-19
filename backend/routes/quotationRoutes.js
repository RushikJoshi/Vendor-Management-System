const express = require("express");
const router = express.Router();
const {
    submitQuotation,
    getQuotationsByRFQ
} = require("../controllers/quotationController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");

router.use(protect);
router.use(restrictToTenant);

router.post("/", submitQuotation);
router.get("/rfq/:rfqId", getQuotationsByRFQ);

module.exports = router;
