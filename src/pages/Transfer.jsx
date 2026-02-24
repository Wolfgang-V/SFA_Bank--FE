import { useState, useEffect } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { fetchAccounts, lookupAccount } from "../services/accountService";
import { transferFunds } from "../services/transactionService";

const STEPS = { FORM: "form", CONFIRM: "confirm", SUCCESS: "success", ERROR: "error", SET_PIN: "set_pin" };

const Transfer = () => {
  const [step, setStep]       = useState(STEPS.FORM);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ receiverAccount: "", amount: "", description: "" });
  const [pin, setPin]         = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [lookupState, setLookupState]   = useState("idle"); 
  const [error, setError]     = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [transferError, setTransferError] = useState("");
  const [requiresPinSetup, setRequiresPinSetup] = useState(false);

  // Load account data on mount
  useEffect(() => {
    const loadAccount = async () => {
      try {
        setLoading(true);
        const accountsData = await fetchAccounts();
        console.log("Transfer: accountsData received:", accountsData);
        const primaryAccount = Array.isArray(accountsData) ? accountsData[0] : accountsData;
        setAccount(primaryAccount);
        console.log("Transfer: primaryAccount set:", primaryAccount);
      } catch (err) {
        console.error("Transfer: Error loading account:", err);
        setError("Failed to load account data.");
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, []);

  const handleChange = (e) => {
    setError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "receiverAccount") {
      setReceiverName("");
      setLookupState("idle");
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  // Real API call to lookup receiver account
  const handleAccountBlur = async () => {
    if (form.receiverAccount.length !== 10) return;
    if (account && form.receiverAccount === account.accountNumber) {
      setError("You cannot transfer to your own account.");
      setLookupState("notfound");
      return;
    }
    setLookupState("loading");
    try {
      const response = await lookupAccount(form.receiverAccount);
      if (response && (response.accountName || response.fullName)) {
        setReceiverName(response.accountName || response.fullName);
        setLookupState("found");
      } else {
        setLookupState("notfound");
        setError("Account not found. Please check the number.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setLookupState("notfound");
      setError("Account not found. Please check the number.");
    }
  };

  const handleProceed = () => {
    if (!form.receiverAccount || form.receiverAccount.length !== 10) { setError("Enter a valid 10-digit account number."); return; }
    if (lookupState !== "found") { setError("Please verify the receiver account first."); return; }
    if (!form.amount || Number(form.amount) <= 0)  { setError("Enter a valid amount."); return; }
    if (account && Number(form.amount) > account.balance)  { setError("Insufficient balance."); return; }
    if (Number(form.amount) > 500000)               { setError("Amount exceeds single transfer limit of ₦500,000."); return; }
    setError("");
    setPin(""); // Reset PIN for new confirmation
    setStep(STEPS.CONFIRM);
  };

  // Real API call to execute transfer
  const handleConfirm = async () => {
    if (!pin || pin.length !== 4) {
      setError("Please enter your 4-digit transaction PIN.");
      return;
    }
    
    setTransferLoading(true);
    setTransferError("");
    try {
      const payload = {
        senderAccount: account.accountNumber,
        receiverAccount: form.receiverAccount,
        amount: Number(form.amount),
        pin: pin,
      };
      console.log("Transfer: Sending transfer request:", payload);
      
      const response = await transferFunds(payload);
      console.log("Transfer: Response received:", response);
      
      // Set reference from response
      setReference(response.referenceNumber || response.reference || response.data?.referenceNumber || "N/A");
      
      // Update account balance directly from response
      if (response.data?.sender) {
        const updatedBalance = response.data.sender.balance;
        console.log("Transfer: Updated balance from response:", updatedBalance);
        setAccount(prev => ({
          ...prev,
          balance: updatedBalance
        }));
      } else {
        // Fallback: fetch fresh account data
        console.log("Transfer: Fetching fresh account data...");
        const updatedAccounts = await fetchAccounts();
        const updatedAccount = Array.isArray(updatedAccounts) ? updatedAccounts[0] : updatedAccounts;
        if (updatedAccount) {
          setAccount(updatedAccount);
        }
      }
      
      setStep(STEPS.SUCCESS);
    } catch (err) {
      console.error("Transfer error:", err);
      console.error("Transfer error response:", err.response?.data);
      const errorData = err.response?.data;
      
      if (errorData?.requiresPinSetup) {
        setRequiresPinSetup(true);
        setStep(STEPS.SET_PIN);
      } else if (errorData?.requiresPin) {
        setError("Please enter your transaction PIN.");
      } else {
        setTransferError(errorData?.message || "Transfer failed. Please try again.");
        setStep(STEPS.ERROR);
      }
    } finally {
      setTransferLoading(false);
    }
  };

  const handleSetPin = () => {
    // Redirect to security page to set up PIN
    window.location.href = "/security";
  };

  const handleReset = () => {
    setStep(STEPS.FORM);
    setForm({ receiverAccount: "", amount: "", description: "" });
    setReceiverName("");
    setLookupState("idle");
    setError("");
    setReference("");
    setTransferError("");
    setPin("");
    setRequiresPinSetup(false);
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

  if (!account) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-wallet2" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
        <p className="text-muted mt-3">No account found</p>
      </div>
    );
  }

  return (
    <div className="sfa-animate">

     
      <div className="mb-4">
        <h4 className="fw-bold mb-0 font-sora">Transfer Funds</h4>
        <p className="mb-0" style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
          Send money to any SFA Bank account instantly
        </p>
      </div>

      <div className="row g-4">
       
        <div className="col-12 col-lg-7">

       
          {step === STEPS.FORM && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-4" style={{ fontSize: "0.95rem" }}>Transfer Details</h6>

              {(error || transferError) && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--red-bg)", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.85rem", color: "var(--red)" }}>
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                  {error || transferError}
                </div>
              )}

              
              <div className="mb-3">
                <label className="sfa-label">From Account</label>
                <div className="p-3 rounded-3" style={{ background: "var(--gold-bg)", border: "1px solid var(--border-gold)" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "var(--gold-dark)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {account.accountType} — {account.accountNumber}
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginTop: 2 }}>
                        {formatCurrency(account.balance || 0)}
                      </div>
                    </div>
                    <i className="bi bi-wallet2" style={{ fontSize: "1.4rem", color: "var(--gold)" }}></i>
                  </div>
                </div>
              </div>

              
              <div className="mb-3">
                <label className="sfa-label">Receiver Account Number</label>
                <div className="sfa-input-group">
                  <span className="sfa-input-icon"><i className="bi bi-person-fill"></i></span>
                  <input
                    type="text" name="receiverAccount"
                    className="sfa-field"
                    placeholder="Enter 10-digit account number"
                    value={form.receiverAccount}
                    onChange={handleChange}
                    onBlur={handleAccountBlur}
                    maxLength={10}
                  />
                  {lookupState === "loading" && (
                    <span style={{ padding: "0 0.75rem" }}>
                      <span className="spinner-border spinner-border-sm" style={{ color: "var(--gold)" }} />
                    </span>
                  )}
                  {lookupState === "found" && (
                    <span style={{ padding: "0 0.75rem", color: "var(--green)" }}>
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                  )}
                </div>
                
                {lookupState === "found" && (
                  <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: "0.83rem", color: "var(--green)", fontWeight: 600 }}>
                    <i className="bi bi-person-check-fill"></i>
                    {receiverName}
                  </div>
                )}
              </div>

              
              <div className="mb-3">
                <label className="sfa-label">Amount (₦)</label>
                <div className="sfa-input-group">
                  <span className="sfa-input-icon" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--gold-dark)" }}>₦</span>
                  <input
                    type="number" name="amount"
                    className="sfa-field"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                {form.amount > 0 && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    Remaining balance: {formatCurrency(account.balance - Number(form.amount))}
                  </div>
                )}
              </div>

              
              <div className="mb-4">
                <label className="sfa-label">
                  Description <span style={{ color: "var(--text-light)", fontWeight: 400 }}>(optional)</span>
                </label>
                <div className="sfa-input-group">
                  <span className="sfa-input-icon"><i className="bi bi-chat-left-text"></i></span>
                  <input
                    type="text" name="description"
                    className="sfa-field"
                    placeholder="What's this for?"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
              </div>

              <button className="sfa-btn-primary w-100 sfa-btn-lg" onClick={handleProceed}>
                Continue <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          )}

          
          {step === STEPS.CONFIRM && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-4" style={{ fontSize: "0.95rem" }}>Confirm Transfer</h6>

             
              <div className="text-center mb-4">
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>You are sending</div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--gold-dark)", fontFamily: "'Sora', sans-serif" }}>
                  {formatCurrency(Number(form.amount))}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  to <strong style={{ color: "var(--text)" }}>{receiverName}</strong>
                </div>
              </div>

              
              <div className="mb-4" style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "1rem" }}>
                {[
                  { label: "From",        value: `${account.accountType} — ${account.accountNumber}` },
                  { label: "To",          value: form.receiverAccount },
                  { label: "Beneficiary", value: receiverName },
                  { label: "Amount",      value: formatCurrency(Number(form.amount)) },
                  ...(form.description ? [{ label: "Description", value: form.description }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.86rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* PIN Input */}
              <div className="mb-4">
                <label className="sfa-label">Enter Transaction PIN</label>
                <div className="sfa-input-group">
                  <span className="sfa-input-icon"><i className="bi bi-lock-fill"></i></span>
                  <input
                    type="password"
                    className="sfa-field"
                    placeholder="••••"
                    value={pin}
                    onChange={handlePinChange}
                    maxLength={4}
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: "0.8rem", color: "var(--red)" }}>
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                  </div>
                )}
              </div>

              <div className="sfa-notice mb-4">
                <i className="bi bi-info-circle-fill" style={{ color: "var(--gold)", flexShrink: 0 }}></i>
                Please confirm the beneficiary name before proceeding. Transfers cannot be reversed.
              </div>

              <div className="d-flex gap-3">
                <button className="sfa-btn-silver flex-grow-1" onClick={() => setStep(STEPS.FORM)} disabled={transferLoading}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <button className="sfa-btn-primary flex-grow-1 sfa-btn-lg" onClick={handleConfirm} disabled={transferLoading}>
                  {transferLoading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                    : <><i className="bi bi-send-fill me-2"></i>Confirm Transfer</>
                  }
                </button>
              </div>
            </div>
          )}

          
          {step === STEPS.SET_PIN && (
            <div className="sfa-card text-center sfa-animate">
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--gold-bg)", border: "3px solid var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <i className="bi bi-shield-lock" style={{ fontSize: "2rem", color: "var(--gold)" }}></i>
              </div>

              <h5 className="font-sora fw-bold mb-1">Set Up Transaction PIN</h5>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                You need to set up a transaction PIN before you can make transfers.
              </p>

              <div className="d-flex gap-3">
                <button className="sfa-btn-outline flex-grow-1" onClick={handleReset}>
                  Go Back
                </button>
                <button className="sfa-btn-primary flex-grow-1" onClick={handleSetPin}>
                  Set Up PIN
                </button>
              </div>
            </div>
          )}

          
          {step === STEPS.SUCCESS && (
            <div className="sfa-card text-center sfa-animate">
              
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--green-bg)", border: "3px solid var(--green)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "var(--green)" }}></i>
              </div>

              <h5 className="font-sora fw-bold mb-1">Transfer Successful!</h5>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                {formatCurrency(Number(form.amount))} has been sent to <strong>{receiverName}</strong>
              </p>

              <div style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                {[
                  { label: "Amount",     value: formatCurrency(Number(form.amount)) },
                  { label: "To",         value: `${receiverName} (${form.receiverAccount})` },
                  { label: "Reference",  value: reference },
                  { label: "Status",     value: "✅ Successful" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-3">
                <button className="sfa-btn-outline flex-grow-1" onClick={handleReset}>
                  New Transfer
                </button>
                <button className="sfa-btn-primary flex-grow-1" onClick={() => window.location.href = "/dashboard"}>
                  Dashboard
                </button>
              </div>
            </div>
          )}

          {step === STEPS.ERROR && (
            <div className="sfa-card text-center sfa-animate">
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--red-bg)", border: "3px solid var(--red)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <i className="bi bi-x-lg" style={{ fontSize: "2rem", color: "var(--red)" }}></i>
              </div>

              <h5 className="font-sora fw-bold mb-1">Transfer Failed</h5>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                {transferError || "An error occurred while processing your transfer."}
              </p>

              <div className="d-flex gap-3">
                <button className="sfa-btn-outline flex-grow-1" onClick={handleReset}>
                  Try Again
                </button>
                <button className="sfa-btn-primary flex-grow-1" onClick={() => window.location.href = "/dashboard"}>
                  Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        
        <div className="col-12 col-lg-5">
          <div className="sfa-card mb-3" style={{ background: "linear-gradient(145deg, #fffdf5, #fdf6e0)", border: "1px solid var(--border-gold)" }}>
            <h6 className="font-sora fw-bold mb-3" style={{ fontSize: "0.88rem", color: "var(--gold-dark)" }}>
              <i className="bi bi-shield-check me-2"></i>Transfer Limits
            </h6>
            {[
              { label: "Single Transfer",  value: "₦500,000" },
              { label: "Daily Limit",      value: "₦1,000,000" },
              { label: "Min. Amount",      value: "₦1,000" },
            ].map(({ label, value }) => (
              <div key={label} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontWeight: 700, color: "var(--gold-dark)" }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="sfa-card">
            <h6 className="font-sora fw-bold mb-3" style={{ fontSize: "0.88rem" }}>
              <i className="bi bi-lightbulb me-2" style={{ color: "var(--gold)" }}></i>Quick Tips
            </h6>
            {[
              "Always verify the beneficiary name before confirming",
              "Transfers are processed instantly 24/7",
              "Keep your reference number for record keeping",
              "Contact support if a transfer fails but funds are debited",
            ].map((tip, i) => (
              <div key={i} className="d-flex gap-2 mb-2" style={{ fontSize: "0.83rem", color: "var(--text-3)" }}>
                <i className="bi bi-dot" style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }}></i>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
