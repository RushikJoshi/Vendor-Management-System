import axios from "axios";
import { toast } from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    // 401 — Session expired, attempt refresh
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;
        
        sessionStorage.setItem("token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // If refresh fails, log out and redirect based on role
        const role = sessionStorage.getItem("role") || "";
        sessionStorage.clear();
        
        if (!window.location.pathname.includes("/login")) {
          const redirectPath = role.toLowerCase() === 'client' ? '/client/login' : '/login';
          window.location.href = `${redirectPath}?expired=true`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (status === 401 && (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login')) {
        // If refresh endpoint itself fails 401, or login fails 401
        if (originalRequest.url === '/auth/refresh') {
          const role = sessionStorage.getItem("role") || "";
          sessionStorage.clear();
          if (!window.location.pathname.includes("/login")) {
            const redirectPath = role.toLowerCase() === 'client' ? '/client/login' : '/login';
            window.location.href = `${redirectPath}?expired=true`;
          }
        }
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

    // 4xx — Components handle their own error display
    return Promise.reject(err);
  }
);

export default api;
