import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("krishiora_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a structured message, preserve it
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please try again.";

    // If 401 Unauthorized occurs on protected routes (not login/signup), clear token and redirect
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/signup")
    ) {
      localStorage.removeItem("krishiora_token");
      localStorage.removeItem("krishiora_user");

      // Only redirect if we're not already on an auth page
      const path = window.location.pathname;
      const isAuthPage = ["/login", "/register", "/forgot-password", "/verify-email", "/auth/callback"].some(
        (p) => path.startsWith(p)
      );
      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
