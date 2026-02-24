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

// Helper to normalize transaction data
const normalizeTransaction = (tx) => {
  if (!tx) return null;
  return {
    ...tx,
    _id: tx._id || tx.id,
    transactionType: tx.transactionType || tx.transaction_type,
    createdAt: tx.createdAt || tx.created_at,
    referenceNumber: tx.referenceNumber || tx.reference_number || tx.reference,
  };
};

// Fetch transactions for a specific account
export async function fetchTransactions(accountId) {
  const response = await api.get(`/accounts/${accountId}/transactions`);
  console.log("Transactions API response:", response.data);
  
  // Handle nested response format: { data: [...], success: true }
  const data = response.data?.data || response.data;
  
  if (Array.isArray(data)) {
    return data.map(normalizeTransaction);
  }
  return normalizeTransaction(data);
}

// Fetch all transactions (if endpoint supports it)
export async function fetchAllTransactions() {
  const response = await api.get("/transactions");
  const data = response.data?.data || response.data;
  
  if (Array.isArray(data)) {
    return data.map(normalizeTransaction);
  }
  return normalizeTransaction(data);
}

// Transfer funds to another account
export async function transferFunds(payload) {
  const response = await api.post("/transfers", payload);
  return response.data?.data || response.data;
}

// Get transfer status by reference
export async function getTransferStatus(reference) {
  const response = await api.get(`/transfers/${reference}`);
  return response.data?.data || response.data;
}

export default {
  fetchTransactions,
  fetchAllTransactions,
  transferFunds,
  getTransferStatus,
};
