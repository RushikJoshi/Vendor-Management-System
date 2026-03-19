const express = require("express");
const router = express.Router();
const {
    sendInvitation,
    verifyInvitation,
    getInvitations
} = require("../controllers/invitationController");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");


router.get("/verify/:token", verifyInvitation);

router.use(protect);

router.get("/", authorizeRoles("admin", "manager"), getInvitations);
router.post(
    "/send",
    authorizeRoles("admin", "manager"),
    sendInvitation
);


module.exports = router;
