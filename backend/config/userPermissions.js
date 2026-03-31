const ACTION_TO_MODULE_KEYS = {
    "users.view": ["users"],
    "users.create": ["users"],
    "users.edit": ["users"],
    "users.delete": ["users"],
    "vendors.view": ["vendor_forms"],
    "vendors.add": ["vendor_forms"],
    "vendors.edit": ["vendor_forms"],
    "rfq.view": ["rfq"],
    "rfq.create": ["rfq"],
    "rfq.approve": ["rfq"],
    "contracts.view": ["contracts"],
    "contracts.manage": ["contracts"],
    "settings.access": ["settings"],
};

function normalizePermissionKey(key) {
    return String(key || "").trim().toLowerCase();
}

function deriveAllowedModulesFromPermissions(permissionKeys = []) {
    const normalized = permissionKeys.map(normalizePermissionKey).filter(Boolean);
    const moduleKeys = new Set();

    normalized.forEach((permissionKey) => {
        const mappedModules = ACTION_TO_MODULE_KEYS[permissionKey] || [];
        mappedModules.forEach((moduleKey) => moduleKeys.add(moduleKey));
    });

    return Array.from(moduleKeys);
}

function sanitizePermissionKeys(permissionKeys = []) {
    return [...new Set(permissionKeys.map(normalizePermissionKey).filter(Boolean))];
}

module.exports = {
    ACTION_TO_MODULE_KEYS,
    normalizePermissionKey,
    deriveAllowedModulesFromPermissions,
    sanitizePermissionKeys,
};
