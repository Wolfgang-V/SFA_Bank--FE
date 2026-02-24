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

// Helper to normalize account data (handle both id and _id)
const normalizeAccount = (account) => {
  if (!account) return null;
  return {
    ...account,
    _id: account._id || account.id,
    accountNumber: account.accountNumber || account.account_number,
    accountType: account.accountType || account.account_type,
    createdAt: account.createdAt || account.created_at,
  };
};

// Fetch all accounts for the logged-in user
export async function fetchAccounts() {
  console.log("accountService: Fetching accounts from:", API_BASE + "/accounts");
  const response = await api.get("/accounts");
  console.log("accountService: Full response:", response);
  console.log("accountService: response.status:", response.status);
  console.log("accountService: response.data:", JSON.stringify(response.data));
  
  // Handle nested response format: { data: [...], success: true }
  const data = response.data?.data || response.data;
  console.log("accountService: Processed data:", data);
  
  if (Array.isArray(data)) {
    return data.map(normalizeAccount);
  }
  return normalizeAccount(data);
}

// Fetch a single account by ID
export async function fetchAccountById(accountId) {
  const response = await api.get(`/accounts/${accountId}`);
  // Handle nested response format
  return response.data?.data || response.data;
}

// Lookup account by account number (for receiver verification)
export async function lookupAccount(accountNumber) {
  const response = await api.get(`/accounts/lookup/${accountNumber}`);
  console.log("accountService: Lookup response:", response.data);
  return response.data?.data || response.data;
}

export default {
  fetchAccounts,
  fetchAccountById,
  lookupAccount,
};
