import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import { fetchAccounts } from "../services/accountService";
import { payBill, getPaymentHistory } from "../services/paymentService";

const billerCategories = [
  { id: "electricity", label: "Electricity", icon: "fa-bolt",           color: "#f59e0b" },
  { id: "internet",    label: "Internet",    icon: "fa-wifi",           color: "#3b82f6" },
  { id: "cable",       label: "Cable TV",    icon: "fa-tv",             color: "#8b5cf6" },
  { id: "phone",       label: "Airtime/Data",icon: "fa-mobile-alt",    color: "#22c55e" },
  { id: "water",       label: "Water",       icon: "fa-tint",           color: "#06b6d4" },
  { id: "betting",     label: "Betting",     icon: "fa-dice",          color: "#2806d4" },
  { id: "other",       label: "Others",      icon: "fa-ellipsis-h",    color: "#94a3b8" },
];

const billers = {
  electricity: [
    { id: "ekedc",    name: "EKEDC (Eko Electric)",    code: "EKEDC"  },
    { id: "ikedc",    name: "IKEDC (Ikeja Electric)",  code: "IKEDC"  },
    { id: "aedc",     name: "AEDC (Abuja Electric)",   code: "AEDC"   },
    { id: "phedc",    name: "PHEDC (Port Harcourt)",   code: "PHEDC"  },
  ],
  internet: [
    { id: "mtn-inet", name: "MTN Internet",            code: "MTN_INT"},
    { id: "glo-inet", name: "Glo Internet",            code: "GLO_INT"},
    { id: "spectranet",name: "Spectranet",             code: "SPECTRA"},
    { id: "smile",    name: "Smile 4G",                code: "SMILE"  },
  ],
  cable: [
    { id: "dstv",     name: "DSTV",                   code: "DSTV"   },
    { id: "gotv",     name: "GOtv",                   code: "GOTV"   },
    { id: "startimes",name: "StarTimes",              code: "STIMES" },
  ],
  phone: [
    { id: "mtn",      name: "MTN",                    code: "MTN"    },
    { id: "glo",      name: "Glo",                    code: "GLO"    },
    { id: "airtel",   name: "Airtel",                 code: "AIRTEL" },
    { id: "9mobile",  name: "9mobile",                code: "9MOB"   },
  ],
  water: [
    { id: "lwsc",     name: "Lagos Water Corp",        code: "LWSC"   },
    { id: "fwsc",     name: "FCT Water Board",         code: "FWSC"   },
  ],
  betting: [
    { id: "sporty",    name: "SPORTYBET ",     code: "SPORTY"   },
    { id: "betking",   name: "BETKING (NG)",   code: "BETKINGNG"},
    { id: "bet9ja",    name: "BET9JA (9JA)",   code: "BET9JA"   },
    { id: "1xbet",     name: "1X BET",         code: "1XBT"     },
  ],
  other: [
    { id: "remita",   name: "Remita",                 code: "REMITA" },
    { id: "lawma",    name: "LAWMA (Waste)",           code: "LAWMA"  },
  ],
};

const STEPS = { FORM: "form", CONFIRM: "confirm", SUCCESS: "success", ERROR: "error" };

const Bills = () => {
  const [step,          setStep]          = useState(STEPS.FORM);
  const [account, setAccount] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category,      setCategory]      = useState("");
  const [selectedBiller,setSelectedBiller]= useState(null);
  const [form,          setForm]          = useState({ customerRef: "", amount: "" });
  const [error,         setError]         = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reference,     setReference]     = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Load account and payment history on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch account for balance
        const accountsData = await fetchAccounts();
        const primaryAccount = Array.isArray(accountsData) ? accountsData[0] : accountsData;
        setAccount(primaryAccount);

        // Fetch payment history
        const historyData = await getPaymentHistory();
        setPaymentHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error("Error loading bills data:", err);
        // Continue with loading even if API fails - show empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setSelectedBiller(null);
    setForm({ customerRef: "", amount: "" });
    setError("");
  };

  const handleProceed = () => {
    if (!selectedBiller)                    { setError("Please select a biller."); return; }
    if (!form.customerRef.trim())           { setError("Please enter your customer/meter/phone reference."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Please enter a valid amount."); return; }
    if (account && Number(form.amount) > account.balance){ setError("Insufficient balance."); return; }
    setError("");
    setStep(STEPS.CONFIRM);
  };

  // Real API call to pay bill
  const handleConfirm = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const payload = {
        billerId: selectedBiller.id,
        billerCode: selectedBiller.code,
        customerReference: form.customerRef,
        amount: Number(form.amount),
      };
      const response = await payBill(payload);
      setReference(response.reference || response.referenceNumber || "N/A");
      setStep(STEPS.SUCCESS);
      
      // Refresh payment history
      const historyData = await getPaymentHistory();
      setPaymentHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.response?.data?.message || "Payment failed. Please try again.");
      setStep(STEPS.ERROR);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReset = () => {
    setStep(STEPS.FORM);
    setCategory("");
    setSelectedBiller(null);
    setForm({ customerRef: "", amount: "" });
    setError("");
    setReference("");
    setPaymentError("");
  };

  const badgeClass = (s) => s === "successful" ? "sfa-badge-success" : s === "pending" ? "sfa-badge-warning" : "sfa-badge-danger";

  const currentCategory = billerCategories.find(c => c.id === category);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sfa-animate">

      
      <div className="mb-4">
        <h4 className="fw-bold mb-0 font-sora">Bill Payments</h4>
        <p className="mb-0" style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
          Pay bills quickly and securely
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">

         
          {step === STEPS.FORM && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-4" style={{ fontSize: "0.95rem" }}>Select Biller</h6>

              {error && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--red-bg)", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.85rem", color: "var(--red)" }}>
                  <i className="fas fa-exclamation-circle flex-shrink-0"></i> {error}
                </div>
              )}

              
              <label className="sfa-label mb-2">Category</label>
              <div className="row g-2 mb-4">
                {billerCategories.map((cat) => (
                  <div key={cat.id} className="col-4 col-sm-3 col-md-2 col-lg-3">
                    <button
                      onClick={() => handleCategorySelect(cat.id)}
                      style={{
                        width: "100%", border: "1.5px solid",
                        borderColor: category === cat.id ? "var(--gold)" : "var(--border)",
                        borderRadius: "var(--radius)", padding: "0.75rem 0.5rem",
                        background: category === cat.id ? "var(--gold-bg)" : "white",
                        cursor: "pointer", textAlign: "center",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <i className={`fas ${cat.icon}`} style={{ fontSize: "1.3rem", color: category === cat.id ? "var(--gold-dark)" : cat.color, display: "block", marginBottom: "0.3rem" }}></i>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: category === cat.id ? "var(--gold-dark)" : "var(--text-3)" }}>{cat.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              
              {category && (
                <>
                  <label className="sfa-label mb-2">
                    {currentCategory?.label} Billers
                  </label>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {billers[category]?.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setSelectedBiller(b); setError(""); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.75rem 1rem", border: "1.5px solid",
                          borderColor: selectedBiller?.id === b.id ? "var(--gold)" : "var(--border)",
                          borderRadius: "var(--radius-sm)",
                          background: selectedBiller?.id === b.id ? "var(--gold-bg)" : "#fafbfc",
                          cursor: "pointer", transition: "all 0.15s ease",
                          textAlign: "left",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{b.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Code: {b.code}</div>
                        </div>
                        {selectedBiller?.id === b.id && (
                          <i className="fas fa-check-circle" style={{ color: "var(--gold)", fontSize: "1.1rem" }}></i>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              
              {selectedBiller && (
                <>
                  <div className="mb-3">
                    <label className="sfa-label">
                      {category === "phone" ? "Phone Number" : category === "electricity" || category === "water" ? "Meter Number" : "Customer ID / Reference"}
                    </label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="fas fa-qrcode"></i></span>
                      <input
                        type="text" className="sfa-field"
                        placeholder={category === "phone" ? "08012345678" : "Enter reference number"}
                        value={form.customerRef}
                        onChange={(e) => { setForm(p => ({ ...p, customerRef: e.target.value })); setError(""); }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="sfa-label">Amount (₦)</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon" style={{ fontWeight: 700, color: "var(--gold-dark)" }}>₦</span>
                      <input
                        type="number" className="sfa-field"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => { setForm(p => ({ ...p, amount: e.target.value })); setError(""); }}
                        min="1"
                      />
                    </div>
                    {form.amount > 0 && account && (
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                        Available balance: {formatCurrency(account.balance)}
                      </div>
                    )}
                  </div>

                  <button className="sfa-btn-primary w-100 sfa-btn-lg" onClick={handleProceed}>
                    Proceed to Pay <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                </>
              )}

              {!category && (
                <div className="sfa-empty py-3">
                  <i className="fas fa-receipt" style={{ fontSize: "2rem", color: "var(--gold-lighter)" }}></i>
                  <p style={{ marginTop: "0.5rem" }}>Select a category to get started</p>
                </div>
              )}
            </div>
          )}

          
          {step === STEPS.CONFIRM && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-4" style={{ fontSize: "0.95rem" }}>Confirm Payment</h6>

              <div className="text-center mb-4">
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>You are paying</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--gold-dark)", fontFamily: "'Sora', sans-serif" }}>
                  {formatCurrency(Number(form.amount))}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  to <strong style={{ color: "var(--text)" }}>{selectedBiller?.name}</strong>
                </div>
              </div>

              <div style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "Biller",      value: selectedBiller?.name },
                  { label: "Reference",   value: form.customerRef     },
                  { label: "Amount",      value: formatCurrency(Number(form.amount)) },
                  { label: "From",        value: account?.accountNumber || "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.86rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="sfa-notice mb-4">
                <i className="fas fa-info-circle" style={{ color: "var(--gold)", flexShrink: 0 }}></i>
                Bill payments are processed instantly. Please verify all details before confirming.
              </div>

              <div className="d-flex gap-3">
                <button className="sfa-btn-silver flex-grow-1" onClick={() => setStep(STEPS.FORM)} disabled={paymentLoading}>
                  <i className="fas fa-arrow-left me-1"></i> Back
                </button>
                <button className="sfa-btn-primary flex-grow-1 sfa-btn-lg" onClick={handleConfirm} disabled={paymentLoading}>
                  {paymentLoading ? <><span className="spinner-border spinner-border-sm me-2" />Paying...</> : <><i className="fas fa-check-circle me-2"></i>Pay Now</>}
                </button>
              </div>
            </div>
          )}

          
          {step === STEPS.SUCCESS && (
            <div className="sfa-card text-center sfa-animate">
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--green-bg)", border: "3px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <i className="fas fa-check" style={{ fontSize: "2rem", color: "var(--green)" }}></i>
              </div>
              <h5 className="font-sora fw-bold mb-1">Payment Successful!</h5>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                {formatCurrency(Number(form.amount))} paid to <strong>{selectedBiller?.name}</strong>
              </p>
              <div style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                {[
                  { label: "Biller",    value: selectedBiller?.name },
                  { label: "Amount",    value: formatCurrency(Number(form.amount)) },
                  { label: "Reference", value: form.customerRef },
                  { label: "TX Ref",    value: reference },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3">
                <button className="sfa-btn-outline flex-grow-1" onClick={handleReset}>Pay Another Bill</button>
                <button className="sfa-btn-primary flex-grow-1" onClick={() => window.location.href = "/dashboard"}>Dashboard</button>
              </div>
            </div>
          )}

          {step === STEPS.ERROR && (
            <div className="sfa-card text-center sfa-animate">
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--red-bg)", border: "3px solid var(--red)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <i className="fas fa-times" style={{ fontSize: "2rem", color: "var(--red)" }}></i>
              </div>
              <h5 className="font-sora fw-bold mb-1">Payment Failed</h5>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                {paymentError || "An error occurred while processing your payment."}
              </p>
              <div className="d-flex gap-3">
                <button className="sfa-btn-outline flex-grow-1" onClick={handleReset}>Try Again</button>
                <button className="sfa-btn-primary flex-grow-1" onClick={() => window.location.href = "/dashboard"}>Dashboard</button>
              </div>
            </div>
          )}
        </div>

       
        <div className="col-12 col-lg-5">
          <div className="sfa-card">
            <h6 className="font-sora fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Recent Payments</h6>
            {paymentHistory.length === 0 ? (
              <div className="sfa-empty"><i className="fas fa-receipt"></i><p>No payments yet</p></div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {paymentHistory.slice(0, 5).map((p) => (
                  <div key={p._id || p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gold-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fas fa-receipt" style={{ color: "var(--gold-dark)", fontSize: "0.9rem" }}></i>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.billerName || p.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(p.createdAt)}</div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--red)" }}>−{formatCurrency(p.amount)}</div>
                      <span className={`sfa-badge ${badgeClass(p.status)}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
