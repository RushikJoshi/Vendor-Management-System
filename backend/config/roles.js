/**
 * RBAC Role Hierarchy — Single Source of Truth for both Backend + Frontend (shared via this constant)
 * Higher number = higher privilege
 */
const ROLE_HIERARCHY = {
    admin: 4,
    hr: 3,
    manager: 2,
    vendor: 0
};

/**
 * Map any raw role string from DB or JWT → normalized lowercase key used in ROLE_HIERARCHY
 */
const ROLE_NORMALIZE_MAP = {
    "admin": "admin",
    "Admin": "admin",
    "hr": "hr",
    "HR": "hr",
    "Human Resources": "hr",
    "manager": "manager",
    "Manager": "manager",
    "vendor": "vendor",
    "Vendor": "vendor",
};


/**
 * Normalize any raw role string to a canonical RBAC role key
 */
function normalizeRole(rawRole) {
    if (!rawRole) return "vendor";
    const str = typeof rawRole === "string" ? rawRole.trim() : String(rawRole);
    return ROLE_NORMALIZE_MAP[str] || ROLE_NORMALIZE_MAP[str.toLowerCase()] || str.toLowerCase();
}

module.exports = { ROLE_HIERARCHY, ROLE_NORMALIZE_MAP, normalizeRole };
