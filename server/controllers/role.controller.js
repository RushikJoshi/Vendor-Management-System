const Role = require("../models/Role");
const Permission = require("../models/Permission");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/responseHandler");

// @desc    Get all roles for a tenant
// @route   GET /api/v1/roles
// @access  Private/Admin
exports.getRoles = asyncHandler(async (req, res, next) => {
    const roles = await Role.find({ 
        $or: [
            { tenantId: req.user.tenantId },
            { tenantId: { $exists: false } }
        ]
    }).populate("permissions");
    
    successResponse(res, "Roles retrieved successfully", roles);
});

// @desc    Create a new custom role
// @route   POST /api/v1/roles
// @access  Private/Admin
exports.createRole = asyncHandler(async (req, res, next) => {
    const { name, permissions, minLimit, maxLimit, accessibleModules, description } = req.body;
    const normalizedName = String(name || "").trim().toLowerCase();

    const existingRole = await Role.findOne({ name: normalizedName, tenantId: req.user.tenantId });
    if (existingRole) {
        return next(new AppError("Role name already exists for this company", 400));
    }

    const role = await Role.create({
        name: normalizedName,
        tenantId: req.user.tenantId,
        permissions,
        minLimit,
        maxLimit,
        accessibleModules,
        description
    });

    successResponse(res, "Role created successfully", role, 201);
});

// @desc    Update a role
// @route   PUT /api/v1/roles/:id
// @access  Private/Admin
exports.updateRole = asyncHandler(async (req, res, next) => {
    if (req.body?.name) {
        req.body.name = String(req.body.name).trim().toLowerCase();
    }
    const role = await Role.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!role) {
        return next(new AppError("Role not found", 404));
    }

    successResponse(res, "Role updated successfully", role);
});

// @desc    Delete a role
// @route   DELETE /api/v1/roles/:id
// @access  Private/Admin
exports.deleteRole = asyncHandler(async (req, res, next) => {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
        return next(new AppError("Role not found", 404));
    }

    successResponse(res, "Role deleted successfully", null);
});

// @desc    Get all available permissions
// @route   GET /api/v1/roles/permissions
// @access  Private/Admin
exports.getAllPermissions = asyncHandler(async (req, res, next) => {
    const permissions = await Permission.find();
    successResponse(res, "Permissions retrieved successfully", permissions);
});
