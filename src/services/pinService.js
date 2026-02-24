import axios from "axios";

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

// Set up transaction PIN
export async function setPin(pin) {
  const response = await api.post("/users/pin", { pin });
  return response.data;
}

// Verify transaction PIN
export async function verifyPin(pin) {
  const response = await api.post("/users/pin/verify", { pin });
  return response.data;
}

export default {
  setPin,
  verifyPin,
};
