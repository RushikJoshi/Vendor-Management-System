import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { normalizeRole, getAllowedModules } from "../config/roles";
import { getEffectivePermissions, sanitizePermissions } from "../config/permissions";
import { getAdminLinksForUser } from "../config/SidebarConfig";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allowedModules, setAllowedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Rehydrate session on mount ────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          const userData = res.data.data;
          const normalizedRole = normalizeRole(userData.role);
          const normalizedPermissions = sanitizePermissions(userData.permissions || []);
          const effectivePermissions =
            normalizedPermissions.length > 0
              ? normalizedPermissions
              : getEffectivePermissions(userData);
          const computedModules =
            Array.isArray(userData.allowedModules) && userData.allowedModules.length
              ? userData.allowedModules
              : getAllowedModules(normalizedRole);
          const hydratedUser = {
            ...userData,
            permissions: effectivePermissions,
            allowedModules: computedModules,
          };
          setUser(hydratedUser);
          setAllowedModules(computedModules);
          localStorage.setItem("role", hydratedUser.role);
          localStorage.setItem("user", JSON.stringify(hydratedUser));
          localStorage.setItem("mustChangePassword", String(!!hydratedUser.mustChangePassword));
        }
      } catch (err) {
        localStorage.clear();
      }
      setLoading(false);
    };
    fetchMe();
  }, []);


  // ── Login ─────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;
    const role = userData?.role || "vendor";
    const normalizedRole = normalizeRole(role);
    const normalizedPermissions = sanitizePermissions(userData?.permissions || []);
    const effectivePermissions =
      normalizedPermissions.length > 0
        ? normalizedPermissions
        : getEffectivePermissions(userData);
    const computedModules =
      Array.isArray(userData.allowedModules) && userData.allowedModules.length
        ? userData.allowedModules
        : getAllowedModules(normalizedRole);
    const mergedUser = {
      ...userData,
      permissions: effectivePermissions,
      allowedModules: computedModules,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(mergedUser));
    localStorage.setItem("mustChangePassword", String(!!mergedUser.mustChangePassword));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(mergedUser);
    setAllowedModules(computedModules);

    if (normalizedRole === "client") {
      if (mergedUser.mustChangePassword) {
        navigate("/client/dashboard"); // For now, no change-password page for clients
      } else {
        navigate("/client/dashboard");
      }
    } else if (normalizedRole !== "vendor") {
      const adminLinks = getAdminLinksForUser(mergedUser, computedModules);
      navigate(adminLinks[0]?.to || "/admin/dashboard");
    } else {
      if (mergedUser.mustChangePassword) {
        navigate("/vendor/change-password");
      } else {
        navigate("/vendor/dashboard");
      }
    }
  };


  // ── After password changed: update state + navigate ───
  const onPasswordChanged = (newToken) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("mustChangePassword", "false");
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser((prev) => {
      const nextUser = { ...(prev || {}), mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
    navigate("/vendor/dashboard");
  };

  // ── Logout ────────────────────────────────────────────
  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, allowedModules, login, logout, loading, onPasswordChanged }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
