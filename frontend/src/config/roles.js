export const ROLE_HIERARCHY = {
  admin: 6,
  hr: 5,
  finance: 4,
  procurement: 3,
  sales: 3,
  viewer: 2,
  vendor: 1,
};

export const ROLE_NORMALIZE_MAP = {
  admin: "admin",
  Admin: "admin",
  superadmin: "admin",
  "Super Admin": "admin",
  system_admin: "admin",
  "System Admin": "admin",
  company_admin: "admin",
  "Company Admin": "admin",
  hr: "hr",
  HR: "hr",
  "Human Resources": "hr",
  finance: "finance",
  Finance: "finance",
  procurement: "procurement",
  Procurement: "procurement",
  sales: "sales",
  Sales: "sales",
  sales_manager: "sales",
  "Sales Manager": "sales",
  manager: "procurement",
  Manager: "procurement",
  viewer: "viewer",
  Viewer: "viewer",
  vendor: "vendor",
  Vendor: "vendor",
};

export const MODULE_PERMISSIONS = {
  admin: ["*"],
  hr: ["dashboard", "users", "roles", "settings"],
  finance: ["dashboard", "contracts", "analytics", "finance"],
  procurement: ["dashboard", "rfq", "contracts", "vendor_forms", "form_builder"],
  sales: ["dashboard", "rfq", "contracts", "analytics"],
  viewer: ["dashboard"],
  vendor: ["vendor_dashboard"],
};

export function normalizeRole(rawRole) {
  if (!rawRole) return "vendor";
  const str = typeof rawRole === "string" ? rawRole.trim() : String(rawRole);
  return ROLE_NORMALIZE_MAP[str] || ROLE_NORMALIZE_MAP[str.toLowerCase()] || str.toLowerCase();
}

export function hasAccess(userRole, requiredRole) {
  const normalized = normalizeRole(userRole);
  const required = normalizeRole(requiredRole);
  const userLevel = ROLE_HIERARCHY[normalized] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[required] ?? 0;
  return userLevel >= requiredLevel;
}

export function getAllowedModules(role) {
  const normalized = normalizeRole(role);
  return MODULE_PERMISSIONS[normalized] || [];
}

export function canAccessModule(role, moduleKey) {
  const allowed = getAllowedModules(role);
  return allowed.includes("*") || allowed.includes(moduleKey);
}
