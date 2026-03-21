const express = require("express");
const router = express.Router();
const { 
  getUsers, 
  createUser, 
  updateUserRole, 
  updateUserStatus,
  updateUser,
  deleteUser
} = require("../controllers/userManagement.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// All routes here are admin only
router.use(protect);
router.use(authorizeRoles("admin")); // Restrict to admin role globally here

router.route("/")
  .get(getUsers)
  .post(createUser);

router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);

router.route("/:id")
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
