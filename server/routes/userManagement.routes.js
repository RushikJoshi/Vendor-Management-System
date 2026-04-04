const express = require("express");
const router = express.Router();
const { 
  getUsers, 
  getUserById,
  createUser, 
  updateUserRole, 
  updateUserStatus,
  updateUser,
  deleteUser
} = require("../controllers/userManagement.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeModules } = require("../middlewares/role.middleware");
const { checkActionAccess } = require("../middlewares/permission.middleware");

router.use(protect);
router.use(authorizeModules("users"));

router.route("/")
  .get(checkActionAccess("users_view"), getUsers)
  .post(checkActionAccess("users_create"), createUser);

router.patch("/:id/role", checkActionAccess("users_edit"), updateUserRole);
router.patch("/:id/status", checkActionAccess("users_edit"), updateUserStatus);

router.route("/:id")
  .get(checkActionAccess("users_view"), getUserById)
  .put(checkActionAccess("users_edit"), updateUser)
  .delete(checkActionAccess("users_delete"), deleteUser);

module.exports = router;
