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
      const token = sessionStorage.getItem("token");
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
          sessionStorage.setItem("role", hydratedUser.role);
          sessionStorage.setItem("user", JSON.stringify(hydratedUser));
          sessionStorage.setItem("mustChangePassword", String(!!hydratedUser.mustChangePassword));
        }
      } catch (err) {
        sessionStorage.clear();
      }
      setLoading(false);
    };
    fetchMe();
  }, []);


  // ── Login ─────────────────────────────────────────────
  const login = async (email, password, portalType = "admin-portal") => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;
    const role = userData?.role || "vendor";
    const normalizedRole = normalizeRole(role);

    // Block cross-portal logins
    if (portalType === "admin-portal" && normalizedRole === "client") {
      throw { response: { data: { message: "Client accounts must log in via the Client Portal." } } };
    }
    if (portalType === "client-portal" && normalizedRole !== "client") {
      throw { response: { data: { message: "Admin/Vendor accounts must log in via the Main Portal." } } };
    }

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

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("user", JSON.stringify(mergedUser));
    sessionStorage.setItem("mustChangePassword", String(!!mergedUser.mustChangePassword));

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
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("mustChangePassword", "false");
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser((prev) => {
      const nextUser = { ...(prev || {}), mustChangePassword: false };
      sessionStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
    navigate("/vendor/dashboard");
  };

  // ── Logout ────────────────────────────────────────────
  const logout = async (isExpired = false) => {
    try {
      // Optional: notify backend to clear refresh token cookie
      await api.post("/auth/logout");
    } catch(e) {
      // ignore errors during logout
    }

    const role = sessionStorage.getItem("role") || (user?.role) || "";
    sessionStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    const isClient = String(role).toLowerCase() === "client";
    const redirectPath = isClient ? "/client/login" : "/login";
    
    if (isExpired) {
      navigate(`${redirectPath}?expired=true`);
    } else {
      navigate(redirectPath);
    }
  };

  // ── Inactivity Timer (10 Minutes) ─────────────────────
  useEffect(() => {
    if (!user) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout(true);
      }, INACTIVITY_LIMIT);
    };

    // Attach listeners to reset timer on user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, allowedModules, login, logout, loading, onPasswordChanged }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
