/**
 * RBAC Role Hierarchy — Frontend Mirror of Backend config/roles.js
 */
export const ROLE_HIERARCHY = {
    admin: 4,
    hr: 3,
    manager: 2,
    reviewer: 1,
    vendor: 0
};


export const ROLE_NORMALIZE_MAP = {
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


export function normalizeRole(rawRole) {
    if (!rawRole) return "vendor";
    const str = typeof rawRole === "string" ? rawRole.trim() : String(rawRole);
    return ROLE_NORMALIZE_MAP[str] || ROLE_NORMALIZE_MAP[str.toLowerCase()] || str.toLowerCase();
}

/**
 * Check if a user with `userRole` has access to a route requiring `requiredRole`
 * Returns true if user's level >= required level
 */
export function hasAccess(userRole, requiredRole) {
    const normalized = normalizeRole(userRole);
    const required = normalizeRole(requiredRole);
    const userLevel = ROLE_HIERARCHY[normalized] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[required] ?? 0;
    return userLevel >= requiredLevel;
}
