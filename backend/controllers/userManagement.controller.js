const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/responseHandler");

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().sort("-createdAt");
    
    successResponse(res, "Users retrieved successfully", users);
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, tenantId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("Email already in use", 400));
    }

    // Role-based tenant logic:
    // If it's an admin, tenantId is optional. 
    // If not admin and not provided, inherit from current user's tenantId.
    const userToCreate = {
        name,
        email,
        password,
        role,
        tenantId: tenantId || (role !== 'admin' ? req.user.tenantId : undefined)
    };

    const user = await User.create(userToCreate);


    successResponse(res, "User created successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
    }, 201);
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    
    if (!["admin", "hr", "manager", "vendor"].includes(role)) {
        return next(new AppError("Invalid role", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    successResponse(res, "User role updated successfully", user);
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
