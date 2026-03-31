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
    "Admin": "admin",
    "superadmin": "admin",
    "Super Admin": "admin",
    "system_admin": "admin",
    "System Admin": "admin",
    "company_admin": "admin",
    "Company Admin": "admin",
    "hr": "hr",
    "HR": "hr",
    "Human Resources": "hr",
    "finance": "finance",
    "Finance": "finance",
    "procurement": "procurement",
    "Procurement": "procurement",
    "sales": "sales",
    "Sales": "sales",
    "sales_manager": "sales",
    "Sales Manager": "sales",
    "manager": "procurement",
    "Manager": "procurement",
    "viewer": "viewer",
    "Viewer": "viewer",
    "vendor": "vendor",
    "Vendor": "vendor"
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
    const str = typeof rawRole === "string" ? rawRole.trim() : String(rawRole);
    return ROLE_NORMALIZE_MAP[str] || ROLE_NORMALIZE_MAP[str.toLowerCase()] || str.toLowerCase();
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
