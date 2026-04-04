import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { normalizeRole, hasAccess, canAccessModule } from "../config/roles";
import { hasAnyPermission, hasPermission } from "../config/permissions";

const MODULE_ALIASES = {
  vendor_forms: ["vendor_forms", "form_builder", "vendors"],
};

const hasModuleAccess = (allowedModules, moduleKey) => {
  const aliases = MODULE_ALIASES[moduleKey] || [moduleKey];
  return aliases.some((key) => allowedModules.includes(key));
};

/**
 * ProtectedRoute — Role hierarchy based. 
 * Props:
 *  - requiredRole: minimum role needed (e.g. "admin", "vendor")
 *  - role: array or string of exact allowed roles (legacy, OR-based)
 *  - module: module-level permission check
 */
export default function ProtectedRoute({ children, requiredRole, role, module, anyPermission, allPermissions }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  const userRole = normalizeRole(user?.role || user?.roleName || "");
  if (
    userRole === "vendor" &&
    user?.mustChangePassword &&
    location.pathname !== "/vendor/change-password"
  ) {
    return <Navigate to="/vendor/change-password" replace />;
  }


  // Hierarchy check: user must have level >= requiredRole
  if (requiredRole) {
    const userAllowedModules = Array.isArray(user?.allowedModules) ? user.allowedModules : [];
    const isInternalCustomRole = userRole !== "vendor" && userAllowedModules.length > 0;
    if (!hasAccess(userRole, requiredRole) && !isInternalCustomRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Explicit role check
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    const normalizedAllowed = allowed.map(r => normalizeRole(r));
    const allowsVendor = normalizedAllowed.includes("vendor");
    const isVendorOnlyRoute = allowsVendor && normalizedAllowed.length === 1;

    if (!normalizedAllowed.includes(userRole)) {
      // Vendor routes must remain strictly vendor-only.
      if (isVendorOnlyRoute) {
        return <Navigate to="/access-denied" replace />;
      }

      const userAllowedModules = Array.isArray(user?.allowedModules) ? user.allowedModules : [];
      const isInternalCustomRole = userRole !== "vendor" && userAllowedModules.length > 0;
      if (!isInternalCustomRole) {
        return <Navigate to="/access-denied" replace />;
      }
    }
  }


  // Module-level access check
  if (module) {
    const userAllowedModules = Array.isArray(user?.allowedModules) ? user.allowedModules : [];
    const hasDynamicModuleAccess =
      userAllowedModules.includes("*") || hasModuleAccess(userAllowedModules, module);

    if (!hasDynamicModuleAccess && !canAccessModule(userRole, module)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  if (anyPermission) {
    const required = Array.isArray(anyPermission) ? anyPermission : [anyPermission];
    if (!hasAnyPermission(user, required)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  if (allPermissions) {
    const required = Array.isArray(allPermissions) ? allPermissions : [allPermissions];
    const hasAll = required.every((permission) => hasPermission(user, permission));
    if (!hasAll) {
      return <Navigate to="/access-denied" replace />;
    }
  }


  return children;
}
