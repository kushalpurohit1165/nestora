import axios from "axios";

// One axios instance used by every page. The address comes from client/.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor: runs before EVERY request and adds the JWT token to the header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nestora_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if a LOGGED-IN user's token is expired or invalid (401),
// clear the session and go to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");
    const hadToken = !!localStorage.getItem("nestora_token");

    if (error.response?.status === 401 && !isLoginCall && hadToken) {
      localStorage.removeItem("nestora_token");
      localStorage.removeItem("nestora_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Pulls the readable message out of an error (used for toasts and form errors)
export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export default api;
