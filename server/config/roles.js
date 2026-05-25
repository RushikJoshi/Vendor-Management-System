const ROLE_HIERARCHY = {
    admin: 6,
    hr: 5,
    compliance: 5,
    manager: 4,
    finance: 4,
    procurement: 3,
    sales: 3,
    reviewer: 2,
    viewer: 2,
    vendor: 1,
    client: 1
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
    "viewer": "viewer",
    "reviewer": "reviewer",
    "vendor": "vendor",
    "client": "client"
};

const MODULE_PERMISSIONS = {
    admin: ["*"],
    hr: ["dashboard", "users", "roles", "settings"],
    compliance: ["dashboard", "vendors", "contracts", "analytics"],
    manager: ["dashboard", "rfq", "contracts", "users"],
    finance: ["dashboard", "contracts", "analytics", "finance", "procurement"],
    procurement: ["dashboard", "rfq", "contracts", "vendor_forms", "form_builder", "procurement"],
    sales: ["dashboard", "rfq", "contracts", "analytics"],
    reviewer: ["dashboard", "rfq"],
    viewer: ["dashboard"],
    vendor: ["vendor_dashboard"],
    client: ["client_dashboard"]
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
