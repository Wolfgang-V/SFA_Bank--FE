import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getStatusBadge, getTransactionIcon } from "../utils/formatCurrency";
import { fetchAccounts } from "../services/accountService";
import { fetchTransactions } from "../services/transactionService";


const quickActions = [
  { to: "/transfer", icon: "bi-arrow-left-right",  label: "Transfer",    color: "#0d6efd", bg: "rgba(13,110,253,0.1)"  },
  { to: "/bills",    icon: "bi-receipt-cutoff",     label: "Pay Bills",   color: "#f0a500", bg: "rgba(240,165,0,0.1)"   },
  { to: "/accounts", icon: "bi-wallet2",            label: "Accounts",    color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  { to: "/settings", icon: "bi-gear-fill",          label: "Settings",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
];


const BalanceCard = ({ account, user }) => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div className="sfa-balance-card mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <p className="mb-0" style={{ fontSize: "0.78rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {account.accountType} Account
          </p>
          <p className="mb-0" style={{ fontSize: "0.9rem", opacity: 0.9, fontWeight: 500 }}>
            {user?.fullName || user?.username}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge"
            style={{ background: "rgba(255,255,255,0.2)", fontSize: "0.72rem", padding: "0.35em 0.7em" }}
          >
            <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem", color: "#4ade80" }}></i>
            Active
          </span>
        </div>
      </div>

      
      <div className="mb-1" style={{ fontSize: "0.78rem", opacity: 0.7 }}>Available Balance</div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h2 className="mb-0 fw-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", letterSpacing: "-0.02em" }}>
          {balanceVisible ? formatCurrency(account.balance) : "₦ ••••••••"}
        </h2>
        <button
          className="btn btn-sm p-0"
          style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", width: 32, height: 32, color: "white" }}
          onClick={() => setBalanceVisible(!balanceVisible)}
          title={balanceVisible ? "Hide balance" : "Show balance"}
        >
          <i className={`bi ${balanceVisible ? "bi-eye-slash" : "bi-eye"}`}></i>
        </button>
      </div>

      
      <div className="d-flex justify-content-between align-items-center">
        <div style={{ fontSize: "0.82rem", opacity: 0.75, letterSpacing: "0.12em" }}>
          {account.accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}
        </div>
        <i className="bi bi-bank2" style={{ fontSize: "1.4rem", opacity: 0.5 }}></i>
      </div>
    </div>
  );
};


const QuickActions = () => (
  <div className="sfa-card mb-4">
    <h6 className="fw-bold mb-3" style={{ fontSize: "0.88rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Quick Actions
    </h6>
    <div className="row g-3">
      {quickActions.map(({ to, icon, label, color, bg }) => (
        <div key={to} className="col-6 col-sm-3">
          <Link to={to} className="sfa-quick-action text-center d-block text-decoration-none">
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{ width: 46, height: 46, borderRadius: 14, background: bg }}
            >
              <i className={`bi ${icon}`} style={{ fontSize: "1.25rem", color }}></i>
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>{label}</div>
          </Link>
        </div>
      ))}
    </div>
  </div>
);


const StatsRow = ({ transactions }) => {
  const totalIn  = transactions.filter(t => t.transactionType === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.transactionType !== "deposit" && t.status === "successful").reduce((s, t) => s + t.amount, 0);
  const pending  = transactions.filter(t => t.status === "pending").length;

  return (
    <div className="row g-3 mb-4">
      {[
        { label: "Money In",        value: formatCurrency(totalIn),  icon: "bi-arrow-down-circle-fill", color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
        { label: "Money Out",       value: formatCurrency(totalOut), icon: "bi-arrow-up-circle-fill",   color: "#ef4444", bg: "rgba(239,68,68,0.08)"    },
        { label: "Pending",         value: `${pending} transaction${pending !== 1 ? "s" : ""}`, icon: "bi-clock-fill", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
      ].map(({ label, value, icon, color, bg }) => (
        <div key={label} className="col-12 col-sm-4">
          <div className="sfa-card d-flex align-items-center gap-3 py-3">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`bi ${icon}`} style={{ fontSize: "1.1rem", color }}></i>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


const RecentTransactions = ({ transactions }) => {
  const isDebit = (type) => ["transfer", "bill_payment", "withdrawal"].includes(type);

  return (
    <div className="sfa-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0" style={{ fontSize: "0.88rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Recent Transactions
        </h6>
        <Link to="/accounts" className="btn btn-sm" style={{ fontSize: "0.8rem", color: "#0d6efd", background: "rgba(13,110,253,0.08)", borderRadius: 8, border: "none", fontWeight: 600 }}>
          View All
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: "2.5rem", color: "#cbd5e1" }}></i>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.88rem" }}>No transactions yet</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx._id}
              className="d-flex align-items-center gap-3 p-2 rounded-3"
              style={{ transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: isDebit(tx.transactionType) ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i
                  className={`bi ${getTransactionIcon(tx.transactionType)}`}
                  style={{ fontSize: "1rem", color: isDebit(tx.transactionType) ? "#ef4444" : "#22c55e" }}
                ></i>
              </div>

              
              <div className="flex-grow-1 min-width-0">
                <div className="fw-semibold text-truncate" style={{ fontSize: "0.88rem" }}>
                  {tx.description}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {formatDate(tx.createdAt)}
                </div>
              </div>

             
              <div className="text-end flex-shrink-0">
                <div
                  className="fw-bold"
                  style={{ fontSize: "0.9rem", color: isDebit(tx.transactionType) ? "#ef4444" : "#22c55e" }}
                >
                  {isDebit(tx.transactionType) ? "−" : "+"}{formatCurrency(tx.amount)}
                </div>
                <span className={`badge bg-${getStatusBadge(tx.status)}`} style={{ fontSize: "0.68rem" }}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const Dashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch accounts first
        const accountsData = await fetchAccounts();
        
        // Get the first account (or handle multiple accounts)
        const primaryAccount = Array.isArray(accountsData) ? accountsData[0] : accountsData;
        
        if (primaryAccount) {
          setAccount(primaryAccount);
          
          // Then fetch transactions for that account
          const transactionsData = await fetchTransactions(primaryAccount._id);
          setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: "3rem" }}></i>
        <p className="text-danger mt-3">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-wallet2" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
        <p className="text-muted mt-3">No account found</p>
      </div>
    );
  }

  return (
    <div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ fontFamily: "'Sora', sans-serif" }}>
            {greeting}, {user?.fullName?.split(" ")[0] || user?.username} 👋
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
            Here's your financial overview
          </p>
        </div>
        <Link to="/transfer" className="btn d-none d-md-flex align-items-center gap-2"
          style={{ background: "linear-gradient(135deg, #0d6efd, #0a4fc4)", color: "white", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", border: "none" }}>
          <i className="bi bi-plus-lg"></i> New Transfer
        </Link>
      </div>

      
      <BalanceCard account={account} user={user} />

     
      <QuickActions />

      
      <StatsRow transactions={transactions} />

      <RecentTransactions transactions={transactions} />
    </div>
  );
};

export default Dashboard;
