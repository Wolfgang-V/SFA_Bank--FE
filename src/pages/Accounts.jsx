import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getStatusBadge, getTransactionIcon } from "../utils/formatCurrency";
import { fetchAccounts } from "../services/accountService";
import { fetchTransactions } from "../services/transactionService";

const typeOptions  = ["All", "transfer", "deposit", "bill_payment"];
const statusOptions = ["All", "successful", "pending", "failed"];

const isDebit = (type) => ["transfer", "bill_payment", "withdrawal"].includes(type);

const Accounts = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo("");
        
        console.log("Accounts page: Starting to fetch accounts...");
        
        // Fetch accounts first
        const accountsData = await fetchAccounts();
        console.log("Accounts page: accountsData received:", accountsData);
        
        // Debug the data structure
        if (!accountsData) {
          setDebugInfo("accountsData is null/undefined");
        } else if (!Array.isArray(accountsData)) {
          setDebugInfo(`accountsData is not an array, type: ${typeof accountsData}`);
        } else if (accountsData.length === 0) {
          setDebugInfo("accountsData is an empty array");
        }
        
        // Get the first account
        const primaryAccount = Array.isArray(accountsData) ? accountsData[0] : accountsData;
        console.log("Accounts page: primaryAccount:", primaryAccount);
        
        if (primaryAccount) {
          setAccount(primaryAccount);
          
          // Fetch transactions for that account
          console.log("Accounts page: Fetching transactions for:", primaryAccount._id);
          const transactionsData = await fetchTransactions(primaryAccount._id);
          console.log("Accounts page: transactionsData:", transactionsData);
          setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        }
      } catch (err) {
        console.error("Accounts page: Error loading accounts data:", err);
        console.error("Accounts page: Error response:", err.response?.data);
        setError(err.response?.data?.message || err.message || "Failed to load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter logic
  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter   === "All" || tx.transactionType === typeFilter;
    const matchStatus = statusFilter === "All" || tx.status          === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const badgeClass = (status) => {
    if (status === "successful") return "sfa-badge-success";
    if (status === "pending")    return "sfa-badge-warning";
    return "sfa-badge-danger";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: "3rem" }}></i>
        <p className="text-danger mt-3">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Show debug info if account is not found
  if (!account) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-wallet" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
        <p className="text-muted mt-3">No account found</p>
        {debugInfo && (
          <div className="mt-3 p-3 bg-light rounded text-start" style={{ fontSize: "0.85rem" }}>
            <strong>Debug Info:</strong> {debugInfo}
          </div>
        )}
        <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="sfa-animate">

     
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0 font-sora">My Account</h4>
          <p className="mb-0" style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
            Manage your account and view transactions
          </p>
        </div>
        <Link to="/transfer" className="sfa-btn-primary">
          <i className="fas fa-plus"></i> New Transfer
        </Link>
      </div>

      
      <div className="sfa-balance-card mb-4 sfa-animate-delay-1">
        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
          <div>
            <div style={{ fontSize: "0.72rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {account.accountType} Account
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, opacity: 0.92 }}>
              {user?.fullName || user?.username}
            </div>
          </div>
          <span
            className="sfa-badge"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: "0.72rem" }}
          >
            <i className="fas fa-circle me-1" style={{ fontSize: "0.45rem", color: "#86efac" }}></i>
            {account.status}
          </span>
        </div>

        <div style={{ fontSize: "0.72rem", opacity: 0.7, marginBottom: "0.25rem" }}>Available Balance</div>
        <div style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
          {formatCurrency(account.balance || 0)}
        </div>

        <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
          <div>
            <div style={{ fontSize: "0.68rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Account Number</div>
            <div style={{ fontSize: "0.88rem", letterSpacing: "0.14em", fontWeight: 600 }}>
              {account.accountNumber ? account.accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : "N/A"}
            </div>
          </div>
          <div className="text-end">
            <div style={{ fontSize: "0.68rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Opened</div>
            <div style={{ fontSize: "0.82rem" }}>{formatDate(account.createdAt)}</div>
          </div>
        </div>
      </div>

      
      <div className="row g-3 mb-4 sfa-animate-delay-2">
        {[
          { label: "Total Credits", icon: "fa-arrow-circle-down", color: "var(--green)", bg: "var(--green-bg)",
            value: formatCurrency(transactions.filter(t => !isDebit(t.transactionType) && t.status === "successful").reduce((s,t) => s + t.amount, 0)) },
          { label: "Total Debits",  icon: "fa-arrow-circle-up",   color: "var(--red)",   bg: "var(--red-bg)",
            value: formatCurrency(transactions.filter(t => isDebit(t.transactionType) && t.status === "successful").reduce((s,t) => s + t.amount, 0)) },
          { label: "Transactions",  icon: "fa-list",              color: "var(--gold-dark)", bg: "var(--gold-bg)",
            value: transactions.length },
        ].map(({ label, icon, color, bg, value }) => (
          <div key={label} className="col-6 col-md-4">
            <div className="sfa-card d-flex align-items-center gap-3 py-3">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`fas ${icon}`} style={{ fontSize: "1.05rem", color }}></i>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sfa-card sfa-animate-delay-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0 font-sora" style={{ fontSize: "0.95rem" }}>Transaction History</h6>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{filtered.length} records</span>
        </div>

       
        <div className="d-flex gap-2 mb-3 flex-wrap">
         
          <div className="sfa-input-group flex-grow-1" style={{ minWidth: 180 }}>
            <span className="sfa-input-icon"><i className="fas fa-search"></i></span>
            <input
              type="text"
              className="sfa-field"
              placeholder="Search description or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="sfa-input-toggle" onClick={() => setSearch("")}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          
          <select
            className="sfa-field"
            style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", fontSize: "0.85rem", background: "#fafbfc", minWidth: 120 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(o => (
              <option key={o} value={o}>{o === "bill_payment" ? "Bill Payment" : o === "All" ? "All Types" : o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>

          
          <select
            className="sfa-field"
            style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", fontSize: "0.85rem", background: "#fafbfc", minWidth: 120 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(o => (
              <option key={o} value={o}>{o === "All" ? "All Status" : o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>

        
        <div className="sfa-table-wrap">
          {filtered.length === 0 ? (
            <div className="sfa-empty">
              <i className="fas fa-inbox"></i>
              <p>No transactions match your search</p>
            </div>
          ) : (
            <table className="sfa-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="d-none d-md-table-cell">Date</th>
                  <th className="d-none d-lg-table-cell">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: isDebit(tx.transactionType) ? "var(--red-bg)" : "var(--green-bg)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className={`fas ${getTransactionIcon(tx.transactionType)}`}
                            style={{ fontSize: "0.9rem", color: isDebit(tx.transactionType) ? "var(--red)" : "var(--green)" }}></i>
                        </div>
                        <span className="fw-semibold" style={{ fontSize: "0.86rem" }}>{tx.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sfa-badge sfa-badge-silver" style={{ fontSize: "0.7rem" }}>
                        {tx.transactionType?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: isDebit(tx.transactionType) ? "var(--red)" : "var(--green)", fontSize: "0.88rem" }}>
                        {isDebit(tx.transactionType) ? "−" : "+"}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`sfa-badge ${badgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="d-none d-md-table-cell" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="d-none d-lg-table-cell" style={{ fontSize: "0.76rem", color: "var(--text-light)", fontFamily: "monospace" }}>
                      {tx.referenceNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      
      {selectedTx && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "1.75rem", maxWidth: 420, width: "100%", boxShadow: "var(--shadow-lg)", animation: "slideUp 0.25s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0 font-sora">Transaction Details</h6>
              <button
                style={{ background: "var(--silver-lighter)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setSelectedTx(null)}
              >
                <i className="fas fa-times" style={{ fontSize: "1rem" }}></i>
              </button>
            </div>

            
            <div className="text-center mb-4">
              <div style={{
                width: 60, height: 60, borderRadius: "50%", margin: "0 auto 0.75rem",
                background: isDebit(selectedTx.transactionType) ? "var(--red-bg)" : "var(--green-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`fas ${getTransactionIcon(selectedTx.transactionType)}`}
                  style={{ fontSize: "1.4rem", color: isDebit(selectedTx.transactionType) ? "var(--red)" : "var(--green)" }}></i>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: isDebit(selectedTx.transactionType) ? "var(--red)" : "var(--green)" }}>
                {isDebit(selectedTx.transactionType) ? "−" : "+"}{formatCurrency(selectedTx.amount)}
              </div>
              <span className={`sfa-badge ${badgeClass(selectedTx.status)} mt-1`}>{selectedTx.status}</span>
            </div>

            {[
              { label: "Description",   value: selectedTx.description },
              { label: "Type",          value: selectedTx.transactionType?.replace("_", " ") },
              { label: "Reference",     value: selectedTx.referenceNumber },
              { label: "Date & Time",   value: formatDate(selectedTx.createdAt) },
              ...(selectedTx.receiverAccount ? [{ label: "Receiver Account", value: selectedTx.receiverAccount }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.86rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 600, color: "var(--text)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
              </div>
            ))}

            <button
              className="sfa-btn-outline w-100 mt-4"
              onClick={() => setSelectedTx(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
