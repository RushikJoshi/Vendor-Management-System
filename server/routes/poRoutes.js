const express = require("express");
const router = express.Router();
const {
    createPO,
    getPOs,
    regenerateAllPOs
} = require("../controllers/poController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");

router.use(protect);
router.use(restrictToTenant);

router.route("/")
    .get(getPOs)
    .post(createPO);

router.get("/regenerate-all", regenerateAllPOs);

module.exports = router;
