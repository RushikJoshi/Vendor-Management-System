const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { normalizeRole } = require("../config/roles");

const syncVendorTenant = async (user) => {
    if (!user || normalizeRole(user.role) !== "vendor" || !user.email) {
        return user;
    }

    const Vendor = require("../models/vendor.model");
    const email = String(user.email || "").trim().toLowerCase();

    let vendor = null;
    if (user.tenantId) {
        vendor = await Vendor.findOne({ email, tenantId: user.tenantId }).select("tenantId");
    }

    if (!vendor) {
        vendor = await Vendor.findOne({ email }).sort({ updatedAt: -1, createdAt: -1 }).select("tenantId");
    }

    if (vendor?.tenantId && String(user.tenantId || "") !== String(vendor.tenantId)) {
        user.tenantId = vendor.tenantId;
        await user.save({ validateBeforeSave: false });
    }

    return user;
};

/**
 * Middleware to protect routes - Verify JWT and attach user to request
 */
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1) Extract token from Authorization header (Bearer token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    // Check cookies if token not in headers (optional, but good for professional apps)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // 2) Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Your session has expired. Please log in again.", 401));
        }
        return next(new AppError("Invalid token. Please log in again.", 401));
    }

    // 3) Check if user still exists
    let currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                "The user belonging to this token no longer exists.",
                401
            )
        );
    }

    currentUser = await syncVendorTenant(currentUser);

    // 4) Fetch Role Details for dynamic RBAC
    const Role = require("../models/Role");
    const normalizedRole = normalizeRole(currentUser.role);
    const roleDetails = await Role.findOne({
        name: normalizedRole,
        $or: [
            { tenantId: currentUser.tenantId },
            { tenantId: { $exists: false } }
        ]
    }).populate("permissions");

    // 5) GRANT ACCESS
    req.user = currentUser;
    req.userRole = roleDetails; // Attach full role details including limits and permissions
    next();
});
