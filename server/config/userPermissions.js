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
    "rfq.manage": "rfq_manage",
    "contracts.view": "contracts_view",
    "contracts.manage": "contracts_manage",
    "sales.manage": "sales_manage",
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
    rfq_manage: ["rfq"],
    contracts_view: ["contracts"],
    contracts_manage: ["contracts"],
    sales_manage: ["sales"],
    settings_access: ["settings"],
    dashboard_view: ["dashboard"],
    vendor_dashboard: ["vendor_dashboard"],
    vendor_rfq_view: ["vendor_dashboard"],
    vendor_quote_submit: ["vendor_dashboard"],
};

const DEFAULT_ROLE_PERMISSIONS = {
    admin: ["*"],
    hr: ["dashboard_view", "users_view", "users_create", "users_edit", "vendors_view", "vendors_add", "vendors_edit"],
    procurement: ["dashboard_view", "vendors_view", "vendors_add", "vendors_edit", "rfq_view", "rfq_create", "rfq_approve", "rfq_manage", "contracts_view", "contracts_manage", "sales_manage"],
    manager: ["dashboard_view", "vendors_view", "rfq_view", "rfq_approve", "rfq_manage", "contracts_view", "users_view"],
    sales: ["dashboard_view", "rfq_view", "rfq_create", "contracts_view", "sales_manage"],
    finance: ["dashboard_view", "rfq_view", "rfq_approve", "rfq_manage", "contracts_view", "contracts_manage"],
    compliance: ["dashboard_view", "vendors_view", "contracts_view"],
    reviewer: ["dashboard_view", "rfq_view"],
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

/**
 * Resolves the final list of active permission keys for a user.
 * Prioritizes Database Role permissions, then direct User permissions, then hardcoded Defaults.
 * @param {Object} user - The basic user document/object
 * @param {Object} fullRole - The populated Role document (including permissions array)
 */
function getEffectivePermissionKeys(user = {}, fullRole = null) {
    let keys = new Set();

    // 1. Add permissions from the Database Role if available (High Priority)
    if (fullRole && Array.isArray(fullRole.permissions)) {
        fullRole.permissions.forEach(p => {
            if (typeof p === "string") keys.add(normalizePermissionKey(p));
            else if (p && p.name) keys.add(normalizePermissionKey(p.name));
        });
    }

    // 2. Add direct user permissions if any (Override/Addition)
    if (Array.isArray(user.permissions)) {
        user.permissions.forEach(p => keys.add(normalizePermissionKey(p)));
    }

    // 3. If still empty, use hardcoded Role defaults (Safety Net)
    if (keys.size === 0) {
        const role = normalizeRole(user.role);
        const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
        defaults.forEach(p => keys.add(normalizePermissionKey(p)));
    }

    return sanitizePermissionKeys(Array.from(keys));
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
