const express = require("express");
const router = express.Router();
const {
    getDepartments,
    createDepartment
} = require("../controllers/departmentController");
const { protect } = require("../middlewares/auth.middleware");
const { restrictToTenant } = require("../middlewares/tenant.middleware");

router.use(protect);
router.use(restrictToTenant);

router.route("/")
    .get(getDepartments)
    .post(createDepartment);

module.exports = router;
