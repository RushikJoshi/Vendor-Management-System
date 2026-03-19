import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { normalizeRole, ROLE_HIERARCHY } from "../config/roles";

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
        console.log("Rehydrating session...");
        const res = await api.get("/auth/me");
        if (res.data.success) {
          const userData = res.data.data;
          console.log("Session rehydrated. User:", userData);
          setUser(userData);
          localStorage.setItem("role", userData.role);
          localStorage.setItem("user", JSON.stringify(userData));

          // Fetch permissions
          try {
            const permRes = await api.get("/auth/permissions");
            if (permRes.data.success) setAllowedModules(permRes.data.allowedModules);
          } catch { /* non-critical */ }
        }
      } catch (err) {
        console.error("Rehydration failed:", err);
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

    console.log("Login successful. Role:", role, "User:", userData);

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userData));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);

    // Fetch permissions
    try {
      const permRes = await api.get("/auth/permissions");
      if (permRes.data.success) setAllowedModules(permRes.data.allowedModules);
    } catch { /* non-critical */ }

    // Route based on role
    const normalizedRole = normalizeRole(role);
    console.log("Normalized Role for routing:", normalizedRole);

    if (["admin", "hr", "manager"].includes(normalizedRole)) {
      console.log("Redirecting to Admin Portal...");
      navigate("/admin/dashboard");
    } else {
      console.log("Redirecting to Vendor Portal...");
      navigate("/vendor/dashboard");
    }
  };


  // ── After password changed: update state + navigate ───
  const onPasswordChanged = (newToken) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("mustChangePassword", "false");
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser(prev => ({ ...prev, mustChangePassword: false }));
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
