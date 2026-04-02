const express = require("express");
const router = express.Router();
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions
} = require("../controllers/role.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Protect all routes
router.use(protect);
// Restrict all role management to admins
router.use(authorizeRoles("admin"));

router.route("/")
    .get(getRoles)
    .post(createRole);

router.get("/permissions", getAllPermissions);

router.route("/:id")
    .put(updateRole)
    .delete(deleteRole);

module.exports = router;
