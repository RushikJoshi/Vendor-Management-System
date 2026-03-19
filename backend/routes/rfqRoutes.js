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

const { authorizeRoles } = require("../middlewares/role.middleware");

router.use(protect);
router.use(restrictToTenant);

router.route("/")
    .get(authorizeRoles("admin", "manager", "vendor"), getRFQs)
    .post(authorizeRoles("admin", "manager"), checkLimit("rfqCount"), createRFQ);

router.route("/:id")
    .get(authorizeRoles("admin", "manager", "vendor"), getRFQ)
    .patch(authorizeRoles("admin", "manager"), updateRFQ);

router.patch("/:id/status", authorizeRoles("admin", "manager"), updateRFQStatus);


module.exports = router;
