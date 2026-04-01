const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/securityMiddleware");
const {
    register,
    onboardCompany,
    login,
    refreshToken,
    logout,
    getMe,
    getPermissions,
    changePassword,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth.middleware");

// Authentication routes
router.post("/register", register);
router.post("/onboard", onboardCompany);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/change-password", protect, changePassword);

// Protected routes
router.get("/me", protect, getMe);
router.get("/permissions", protect, getPermissions);

module.exports = router;
