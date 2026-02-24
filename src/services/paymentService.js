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

// Helper to normalize payment data
const normalizePayment = (payment) => {
  if (!payment) return null;
  return {
    ...payment,
    _id: payment._id || payment.id,
    createdAt: payment.createdAt || payment.created_at,
    billerName: payment.billerName || payment.biller_name,
  };
};

// Pay a bill
export async function payBill(payload) {
  const response = await api.post("/payments", payload);
  return response.data?.data || response.data;
}

// Get payment history
export async function getPaymentHistory() {
  const response = await api.get("/payments");
  console.log("Payment history API response:", response.data);
  
  // Handle nested response format: { data: [...], success: true }
  const data = response.data?.data || response.data;
  
  if (Array.isArray(data)) {
    return data.map(normalizePayment);
  }
  return normalizePayment(data);
}

// Get biller categories
export async function getBillerCategories() {
  const response = await api.get("/billers/categories");
  return response.data?.data || response.data;
}

// Get billers by category
export async function getBillersByCategory(categoryId) {
  const response = await api.get(`/billers/${categoryId}`);
  return response.data?.data || response.data;
}

export default {
  payBill,
  getPaymentHistory,
  getBillerCategories,
  getBillersByCategory,
};
