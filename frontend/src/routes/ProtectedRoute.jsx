import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { normalizeRole, hasAccess } from "../config/roles";

/**
 * ProtectedRoute — Role hierarchy based. 
 * Props:
 *  - requiredRole: minimum role needed (e.g. "admin", "vendor")
 *  - role: array or string of exact allowed roles (legacy, OR-based)
 *  - module: module-level permission check
 */
export default function ProtectedRoute({ children, requiredRole, role, module }) {
  const { user, allowedModules } = useContext(AuthContext);

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  const userRole = normalizeRole(user?.role || user?.roleName || "");


  // Hierarchy check: user must have level >= requiredRole
  if (requiredRole) {
    if (!hasAccess(userRole, requiredRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Role check: Admin routes usually allow any internal role
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    const normalizedAllowed = allowed.map(r => normalizeRole(r));
    
    // If it's an internal route check (admin/hr/manager), 
    // allow any user whose role is NOT vendor and has some allowedModules,
    // OR if their specific role is in the list.
    const isInternalRoute = normalizedAllowed.includes("admin") || normalizedAllowed.includes("hr");
    
    if (isInternalRoute) {
        if (userRole === "vendor") return <Navigate to="/access-denied" replace />;
    } else {
        // Strict check for single roles (like specific vendor routes)
        if (!normalizedAllowed.includes(userRole)) {
            return <Navigate to="/access-denied" replace />;
        }
    }
  }


  // Module-level access check
  if (module && allowedModules) {
    const adminRoles = ["admin"]; // hr and manager are checking against hierarchy mostly
    if (!adminRoles.includes(userRole)) {
      if (!allowedModules.includes(module)) {
        return <Navigate to="/access-denied" replace />;
      }
    }
  }


  return children;
}
