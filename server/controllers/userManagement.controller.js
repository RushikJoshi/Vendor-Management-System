const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/responseHandler");
const {
    sanitizePermissionKeys,
    getDefaultPermissionsForRole,
} = require("../config/userPermissions");
const { normalizeRole } = require("../config/roles");

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const tenantFilter = req.user?.tenantId ? { tenantId: req.user.tenantId } : {};
    const users = await User.find(tenantFilter).sort("-createdAt");
    
    successResponse(res, "Users retrieved successfully", users);
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    successResponse(res, "User retrieved successfully", user);
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, tenantId, permissions = [], role = "viewer" } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("Email already in use", 400));
    }

    const normalizedRole = normalizeRole(role);
    const sanitizedPermissions = sanitizePermissionKeys(permissions);
    const effectivePermissions =
        sanitizedPermissions.length > 0
            ? sanitizedPermissions
            : getDefaultPermissionsForRole(normalizedRole);

    const userToCreate = {
        name,
        email,
        password,
        role: normalizedRole,
        permissions: effectivePermissions,
        tenantId: tenantId || req.user.tenantId
    };

    const user = await User.create(userToCreate);

    // If the created user is a vendor, auto-sync to the Vendor registry so it appears in the Vendors list
    if (normalizedRole === "vendor") {
        const Vendor = require("../models/Vendor");
        try {
            await Vendor.create({
                name: user.name,
                companyName: user.name,
                email: user.email,
                phone: "0000000000",
                status: "active",
                lifecycleStatus: "active",
                createdBy: req.user._id,
                tenantId: user.tenantId || "600000000000000000000001", // fallback if no tenant
            });
        } catch (err) {
            console.error("Vendor auto-sync failed:", err.message);
        }
    }


    successResponse(res, "User created successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        status: user.status
    }, 201);
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    successResponse(res, "Role-based assignment is disabled. Use permissions instead.", user);
});

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
        return next(new AppError("Invalid status", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    successResponse(res, `User account ${status === 'active' ? 'activated' : 'deactivated'} successfully`, user);
});

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email, permissions = [], role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Check if new email is taken
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return next(new AppError("Email already in use", 400));
        }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    const normalizedRole = role ? normalizeRole(role) : normalizeRole(user.role);
    const sanitizedPermissions = sanitizePermissionKeys(permissions);
    user.permissions =
        sanitizedPermissions.length > 0
            ? sanitizedPermissions
            : getDefaultPermissionsForRole(normalizedRole);
    const oldRole = user.role;
    user.role = normalizedRole;

    await user.save();

    // If the updated user is now a vendor, auto-sync to the Vendor registry so it appears in the Vendors list
    if (normalizedRole === "vendor" && oldRole !== "vendor") {
        const Vendor = require("../models/Vendor");
        try {
            await Vendor.findOneAndUpdate(
                { email: user.email },
                {
                    $setOnInsert: {
                        name: user.name,
                        companyName: user.name,
                        phone: "0000000000",
                        status: "active",
                        lifecycleStatus: "active",
                        createdBy: req.user._id,
                        tenantId: user.tenantId || "600000000000000000000001",
                    }
                },
                { upsert: true }
            );
        } catch (err) {
            console.error("Vendor auto-sync failed:", err.message);
        }
    }

    successResponse(res, "User updated successfully", user);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    successResponse(res, "User deleted successfully", null);
});
