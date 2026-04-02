import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    // 401 — Session expired, force re-login
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("mustChangePassword");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
      return Promise.reject(err);
    }

    // 423 — Account locked
    if (status === 423) {
      toast.error(message);
      return Promise.reject(err);
    }

    // 5xx — Server errors, always show toast
    if (status >= 500) {
      toast.error("Server error. Please try again.");
    }

    // 4xx — Components handle their own error display (avoid double toasts)
    // Just reject so the component's catch block runs
    return Promise.reject(err);
  }
);

export default api;
