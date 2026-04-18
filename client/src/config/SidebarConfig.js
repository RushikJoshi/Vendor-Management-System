import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  Users,
  Settings,
} from "lucide-react";
import { normalizeRole, hasAccess } from "./roles";
import { hasAnyPermission } from "./permissions";

const MODULE_ALIASES = {
  vendor_forms: ["vendor_forms", "form_builder", "vendors"],
};

const hasModuleAccess = (allowedModules = [], moduleKey) => {
  const aliases = MODULE_ALIASES[moduleKey] || [moduleKey];
  return aliases.some((key) => allowedModules.includes(key));
};

export const sidebarItems = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "hr", "sales", "finance", "procurement", "viewer"] },
  { key: "applications", label: "Applications", path: "/admin/applications", icon: FileText, allowedRoles: ["admin", "hr"] },
  { key: "vendors", label: "Vendors", path: "/admin/vendors", icon: Building2, allowedRoles: ["admin", "procurement"] },
  { key: "vendor_forms", label: "Form Builder", path: "/admin/vendor-forms", icon: LayoutDashboard, allowedRoles: ["admin", "procurement"] },
  { key: "vendor_forms", label: "Categories", path: "/admin/categories", icon: LayoutDashboard, allowedRoles: ["admin", "procurement"] },
  { key: "rfq", label: "RFQs", path: "/admin/rfqs", icon: FileText, allowedRoles: ["admin", "sales", "procurement"] },
  { key: "procurement", label: "Procurement", path: "/admin/procurement", icon: FileText, allowedRoles: ["admin", "procurement", "finance"], end: true },
  { key: "procurement", label: "Service Orders", path: "/admin/procurement/service-orders", icon: FileText, allowedRoles: ["admin", "procurement", "finance"] },
  { key: "contracts", label: "Contracts", path: "/admin/contracts", icon: FileSignature, allowedRoles: ["admin", "sales", "procurement", "finance"] },
  { key: "users", label: "Users", path: "/admin/users", icon: Users, allowedRoles: ["admin", "hr"] },
  { key: "procurement", label: "Document Settings", path: "/admin/procurement/settings", icon: Settings, allowedRoles: ["admin", "procurement"] },
  { key: "settings", label: "Settings", path: "/admin/settings", icon: Settings, allowedRoles: ["admin", "hr", "finance", "procurement", "viewer"] },
];

export const getAdminLinksForUser = (user, allowedModules = []) => {
  const userRole = normalizeRole(user?.role || user?.roleName || "");

  return sidebarItems
    .filter((item) => {
      if (userRole === "admin") return true;
      if (Array.isArray(item.requiredAnyPermissions) && item.requiredAnyPermissions.length > 0) {
        return hasAnyPermission(user, item.requiredAnyPermissions);
      }
      if (allowedModules && allowedModules.length > 0) {
        return allowedModules.includes("*") || hasModuleAccess(allowedModules, item.key);
      }
      return item.allowedRoles
        ? item.allowedRoles.includes(userRole)
        : hasAccess(userRole, item.requiredRole || "admin");
    })
    .map((item) => ({
      to: item.path,
      label: item.label,
      icon: item.icon,
      end: item.end,
    }));
};
