import axios from "axios";

// Base API URL — change this when your backend is ready
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sfa_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ENDPOINTS ───────────────────────────────────────────

// Register a new user
// POST /api/auth/register
export const registerUser = async ({ username, email, password, fullName, phoneNumber }) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
    full_name: fullName,
    phone_number: phoneNumber,
  });
  return response.data; // { user, token }
};

// Login existing user
// POST /api/auth/login
export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // { user, token }
};

// Request password reset email
// POST /api/auth/forgot-password
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset password with token from email
// POST /api/auth/reset-password
export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
};

export default api;
