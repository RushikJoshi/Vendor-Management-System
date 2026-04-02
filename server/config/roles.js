const ROLE_HIERARCHY = {
    admin: 6,
    hr: 5,
    finance: 4,
    procurement: 3,
    sales: 3,
    viewer: 2,
    vendor: 1
};

const ROLE_NORMALIZE_MAP = {
    "admin": "admin",
    "superadmin": "admin",
    "super admin": "admin",
    "system_admin": "admin",
    "system admin": "admin",
    "company_admin": "admin",
    "company admin": "admin",
    "hr": "hr",
    "human resources": "hr",
    "finance": "finance",
    "procurement": "procurement",
    "sales": "sales",
    "sales_manager": "sales",
    "sales manager": "sales",
    "manager": "procurement",
    "viewer": "viewer",
    "vendor": "vendor"
};

const MODULE_PERMISSIONS = {
    admin: ["*"],
    hr: ["dashboard", "users", "roles", "settings"],
    finance: ["dashboard", "contracts", "analytics", "finance"],
    procurement: ["dashboard", "rfq", "contracts", "vendor_forms", "form_builder"],
    sales: ["dashboard", "rfq", "contracts", "analytics"],
    viewer: ["dashboard"],
    vendor: ["vendor_dashboard"]
};

function normalizeRole(rawRole) {
    if (!rawRole) return "vendor";
    const str = (typeof rawRole === "string" ? rawRole.trim() : String(rawRole)).toLowerCase();
    return ROLE_NORMALIZE_MAP[str] || str;
}

function getAllowedModules(rawRole) {
    const role = normalizeRole(rawRole);
    return MODULE_PERMISSIONS[role] || [];
}

function canAccessModule(rawRole, moduleKey) {
    const allowed = getAllowedModules(rawRole);
    return allowed.includes("*") || allowed.includes(moduleKey);
}

module.exports = {
    ROLE_HIERARCHY,
    ROLE_NORMALIZE_MAP,
    MODULE_PERMISSIONS,
    normalizeRole,
    getAllowedModules,
    canAccessModule
};
