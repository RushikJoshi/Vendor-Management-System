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
const { authorizeModules } = require("../middlewares/role.middleware");
const { checkActionAccess } = require("../middlewares/permission.middleware");

router.use(protect);
router.use(authorizeModules("users"));

router.route("/")
  .get(checkActionAccess("users.view"), getUsers)
  .post(checkActionAccess("users.create"), createUser);

router.patch("/:id/role", checkActionAccess("users.edit"), updateUserRole);
router.patch("/:id/status", checkActionAccess("users.edit"), updateUserStatus);

router.route("/:id")
  .put(checkActionAccess("users.edit"), updateUser)
  .delete(checkActionAccess("users.delete"), deleteUser);

module.exports = router;
