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

const { authorizeModules } = require("../middlewares/role.middleware");

router.use(protect);
router.use(restrictToTenant);

router.route("/")
    .get(authorizeModules("rfq"), getRFQs)
    .post(authorizeModules("rfq"), checkLimit("rfqCount"), createRFQ);

router.route("/:id")
    .get(authorizeModules("rfq"), getRFQ)
    .patch(authorizeModules("rfq"), updateRFQ);

router.patch("/:id/status", authorizeModules("rfq"), updateRFQStatus);


module.exports = router;
