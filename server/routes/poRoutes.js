const express = require("express");
const router = express.Router();
const {
    createPO,
    getPOs,
    getPOById,
    regenerateAllPOs
} = require("../controllers/poController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.use(protect);
router.use(restrictToTenant);

router.get("/regenerate-all", authorizeRoles("admin", "procurement"), regenerateAllPOs);

router.route("/")
    .get(getPOs)
    .post(createPO);

router.route("/:id")
    .get(getPOById);

module.exports = router;
