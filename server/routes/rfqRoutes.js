const express = require("express");
const router = express.Router();
const {
    createRFQ,
    getRFQs,
    getRFQ,
    updateRFQ,
    updateRFQStatus
} = require("../controllers/rfqController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");
const { checkLimit } = require("../middlewares/usage.middleware");
const { checkActionAccess, checkAnyActionAccess } = require("../middlewares/permission.middleware");

router.use(protect);
router.use(restrictToTenant);

router.route("/")
    .get(checkAnyActionAccess("rfq_view", "vendor_rfq_view"), getRFQs)
    .post(checkActionAccess("rfq_create"), checkLimit("rfqCount"), createRFQ);

router.route("/:id")
    .get(checkAnyActionAccess("rfq_view", "vendor_rfq_view"), getRFQ)
    .patch(checkActionAccess("rfq_create"), updateRFQ);

router.patch("/:id/status", checkActionAccess("rfq_approve"), updateRFQStatus);


module.exports = router;
