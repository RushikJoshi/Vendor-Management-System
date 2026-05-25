const User = require("../models/User");
const Company = require("../models/Company");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { normalizeRole, getAllowedModules } = require("../config/roles");
const {
  deriveAllowedModulesFromPermissions,
  sanitizePermissionKeys,
  getDefaultPermissionsForRole,
} = require("../config/userPermissions");

const MODULE_ALIAS_MAP = {
  dashboard: "dashboard",
  "vendor forms": "vendor_forms",
  "form builder": "vendor_forms",
  submissions: "submissions",
  rfqs: "rfq",
  rfq: "rfq",
  contracts: "contracts",
  analytics: "analytics",
  users: "users",
  roles: "roles",
  settings: "settings",
  vendors: "vendor_forms",
  "users.view": "users.view",
  "users.create": "users.create",
  "users.edit": "users.edit",
  "users.delete": "users.delete",
  "vendors.view": "vendors.view",
  "vendors.add": "vendors.add",
  "rfq.view": "rfq.view",
  "rfq.create": "rfq.create",
  "rfq.approve": "rfq.approve",
  "contracts.view": "contracts.view",
  "contracts.manage": "contracts.manage",
  "settings.access": "settings.access",
};

const normalizeModules = (modules = []) =>
  modules
    .map((m) => String(m || "").trim().toLowerCase())
    .map((m) => MODULE_ALIAS_MAP[m] || m.replace(/\s+/g, "_"));

/**
 * @desc    Generate JWT tokens (Access & Refresh)
 * @param   {string} id - User ID
 * @returns {object} tokens - Access and Refresh tokens
 */
const generateTokens = (id, tenantId) => {
  const accessToken = jwt.sign({ id, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });

  const refreshToken = jwt.sign({ id, tenantId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, tenantId } = req.body;

  // Email already exists check
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    tenantId
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    },
  });
});

// @desc    Onboard a new company (Create company + Admin)
// @route   POST /api/auth/onboard
// @access  Public
exports.onboardCompany = asyncHandler(async (req, res, next) => {
  const { companyName, companyEmail, adminName, adminEmail, password } = req.body;

  // Check if company already exists
  const existingCompany = await Company.findOne({ email: companyEmail });
  if (existingCompany) {
    return next(new AppError("Company with this email already exists", 400));
  }

  // Check if admin user exists
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // 1. Create Company
  const company = await Company.create({
    name: companyName,
    email: companyEmail,
  });

  // 2. Create Admin User
  const user = await User.create({
    name: adminName,
    email: adminEmail,
    password,
    role: "company_admin",
    tenantId: company._id,
  });

  res.status(201).json({
    success: true,
    message: "Company onboarded successfully",
    data: {
      company,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const logger = require("../utils/logger");

  logger.info(`Login attempt for email: ${email}`);

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    logger.warn(`Login failed: User not found for email: ${email}`);
    return next(new AppError("Invalid email or password", 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Login failed: Incorrect password for email: ${email}`);
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.tenantId);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Store Refresh Token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    mustChangePassword: !!user.mustChangePassword,
  };

  const normalizedRole = normalizeRole(user.role);
  const directPermissions = sanitizePermissionKeys(user.permissions || []);
  const effectivePermissions =
    directPermissions.length > 0
      ? directPermissions
      : getDefaultPermissionsForRole(normalizedRole);

  // Fetch Role Details for dynamic RBAC (legacy fallback)
  const Role = require("../models/Role");
  const roleDetails = await Role.findOne({
    name: normalizedRole,
    $or: [
        { tenantId: user.tenantId },
        { tenantId: { $exists: false } }
    ]
  }).populate("permissions");

  const allowedModules =
    effectivePermissions.length > 0
      ? deriveAllowedModulesFromPermissions(effectivePermissions)
      : roleDetails?.accessibleModules?.length
      ? normalizeModules(roleDetails.accessibleModules)
      : getAllowedModules(normalizedRole);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      mustChangePassword: !!user.mustChangePassword,
      allowedModules,
      permissions: effectivePermissions,
      directPermissions,
      roleDetails
    },
  });
});


// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (Uses Cookie)
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("No refresh token provided", 401));
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  // Check if token exists in DB for that user
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError("Invalid refresh token", 401));
  }

  // Generate new access token
  const accessToken = jwt.sign({ id: user._id, tenantId: user.tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: { accessToken, user: { id: user._id, role: user.role, tenantId: user.tenantId } },
  });
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public (Uses Cookie)
exports.logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null },
      { new: true }
    );
  }

  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  const normalizedRole = normalizeRole(user.role);
  const directPermissions = sanitizePermissionKeys(user.permissions || []);
  const effectivePermissions =
    directPermissions.length > 0
      ? directPermissions
      : getDefaultPermissionsForRole(normalizedRole);
  const Role = require("../models/Role");
  const roleDetails = await Role.findOne({
    name: normalizedRole,
    $or: [{ tenantId: user.tenantId }, { tenantId: { $exists: false } }]
  }).populate("permissions");
  const allowedModules =
    effectivePermissions.length > 0
      ? deriveAllowedModulesFromPermissions(effectivePermissions)
      : roleDetails?.accessibleModules?.length
      ? normalizeModules(roleDetails.accessibleModules)
      : getAllowedModules(normalizedRole);

  res.status(200).json({
    success: true,
    data: {
        ...user.toObject(),
        roleDetails,
        allowedModules,
        permissions: effectivePermissions,
        directPermissions,
    },
  });
});

// @desc    Change current user's password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new AppError("Current password and new password are required", 400));
  }
  if (String(newPassword).length < 8) {
    return next(new AppError("New password must be at least 8 characters", 400));
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError("Current password is incorrect", 400));
  }

  const samePassword = await user.comparePassword(newPassword);
  if (samePassword) {
    return next(new AppError("New password must be different from current password", 400));
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id, user.tenantId);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      mustChangePassword: false,
    },
  });
});

// @desc    Get permissions for logged in user
// @route   GET /api/auth/permissions
// @access  Private
exports.getPermissions = asyncHandler(async (req, res, next) => {
  const directPermissions = sanitizePermissionKeys(req.user?.permissions || []);
  const role = normalizeRole(req.user?.role);
  const effectivePermissions =
    directPermissions.length > 0
      ? directPermissions
      : getDefaultPermissionsForRole(role);
  const allowedModules = getAllowedModules(role);
  res.status(200).json({
    success: true,
    allowedModules:
      effectivePermissions.length > 0
        ? deriveAllowedModulesFromPermissions(effectivePermissions)
        : allowedModules,
    permissions: effectivePermissions,
    directPermissions,
  });
});
