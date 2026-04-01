const { normalizeRole } = require("./roles");

const PERMISSION_ALIASES = {
    "users.view": "users_view",
    "users.create": "users_create",
    "users.edit": "users_edit",
    "users.delete": "users_delete",
    "vendors.view": "vendors_view",
    "vendors.add": "vendors_add",
    "vendors.edit": "vendors_edit",
    "rfq.view": "rfq_view",
    "rfq.create": "rfq_create",
    "rfq.approve": "rfq_approve",
    "contracts.view": "contracts_view",
    "contracts.manage": "contracts_manage",
    "settings.access": "settings_access",
    "vendor.dashboard": "vendor_dashboard",
    "vendor.rfq.view": "vendor_rfq_view",
    "vendor.quote.submit": "vendor_quote_submit",
};

const ACTION_TO_MODULE_KEYS = {
    users_view: ["users"],
    users_create: ["users"],
    users_edit: ["users"],
    users_delete: ["users"],
    vendors_view: ["vendor_forms"],
    vendors_add: ["vendor_forms"],
    vendors_edit: ["vendor_forms"],
    rfq_view: ["rfq"],
    rfq_create: ["rfq"],
    rfq_approve: ["rfq"],
    contracts_view: ["contracts"],
    contracts_manage: ["contracts"],
    settings_access: ["settings"],
    dashboard_view: ["dashboard"],
    vendor_dashboard: ["vendor_dashboard"],
    vendor_rfq_view: ["vendor_dashboard"],
    vendor_quote_submit: ["vendor_dashboard"],
};

const DEFAULT_ROLE_PERMISSIONS = {
    admin: ["*"],
    hr: ["dashboard_view", "users_view", "users_create", "users_edit", "vendors_view", "vendors_add", "vendors_edit"],
    procurement: ["dashboard_view", "vendors_view", "vendors_add", "vendors_edit", "rfq_view", "rfq_create", "rfq_approve", "contracts_view", "contracts_manage"],
    manager: ["dashboard_view", "vendors_view", "rfq_view", "contracts_view", "users_view"],
    sales: ["dashboard_view", "rfq_view", "rfq_create", "contracts_view"],
    finance: ["dashboard_view", "contracts_view", "contracts_manage"],
    viewer: ["dashboard_view"],
    vendor: ["vendor_dashboard", "vendor_rfq_view", "vendor_quote_submit"],
};

function normalizePermissionKey(key) {
    const raw = String(key || "").trim().toLowerCase();
    if (!raw) return "";
    const aliasMapped = PERMISSION_ALIASES[raw] || raw;
    return aliasMapped.replace(/[.\s]+/g, "_");
}

function sanitizePermissionKeys(permissionKeys = []) {
    return [...new Set(permissionKeys.map(normalizePermissionKey).filter(Boolean))];
}

function hasPermission(permissionKeys = [], requiredPermission) {
    const normalizedPermissions = sanitizePermissionKeys(permissionKeys);
    const required = normalizePermissionKey(requiredPermission);
    if (!required) return false;
    return normalizedPermissions.includes("*") || normalizedPermissions.includes(required);
}

function getDefaultPermissionsForRole(rawRole) {
    const role = normalizeRole(rawRole);
    return sanitizePermissionKeys(DEFAULT_ROLE_PERMISSIONS[role] || []);
}

function getEffectivePermissionKeys(userLike = {}) {
    const directPermissions = sanitizePermissionKeys(userLike.permissions || []);
    if (directPermissions.length > 0) return directPermissions;
    return getDefaultPermissionsForRole(userLike.role);
}

function deriveAllowedModulesFromPermissions(permissionKeys = []) {
    const normalized = sanitizePermissionKeys(permissionKeys);
    const moduleKeys = new Set();

    normalized.forEach((permissionKey) => {
        if (permissionKey === "*") {
            moduleKeys.add("*");
            return;
        }
        const mappedModules = ACTION_TO_MODULE_KEYS[permissionKey] || [];
        mappedModules.forEach((moduleKey) => moduleKeys.add(moduleKey));
    });

    return Array.from(moduleKeys);
}

module.exports = {
    ACTION_TO_MODULE_KEYS,
    DEFAULT_ROLE_PERMISSIONS,
    normalizePermissionKey,
    sanitizePermissionKeys,
    hasPermission,
    getDefaultPermissionsForRole,
    getEffectivePermissionKeys,
    deriveAllowedModulesFromPermissions,
};
