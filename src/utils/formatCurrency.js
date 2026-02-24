// Format number as Nigerian Naira
export const formatCurrency = (amount, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};


export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
};


export const maskAccount = (accountNumber) => {
  if (!accountNumber) return "";
  return `****${accountNumber.slice(-4)}`;
};

export const getStatusBadge = (status) => {
  const map = {
    successful: "success",
    pending: "warning",
    failed: "danger",
    active: "success",
    frozen: "info",
    closed: "secondary",
  };
  return map[status?.toLowerCase()] || "secondary";
};


export const getTransactionIcon = (type) => {
  const map = {
    transfer: "bi-arrow-left-right",
    deposit: "bi-arrow-down-circle",
    withdrawal: "bi-arrow-up-circle",
    bill_payment: "bi-receipt",
  };
  return map[type?.toLowerCase()] || "bi-circle";
};
