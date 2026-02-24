import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import { setPin } from "../services/pinService";

const mockActivity = [
  { id: 1, event: "Login",           device: "Chrome · Windows",    location: "Lagos, NG",     time: "2026-02-17T07:55:00", success: true  },
  { id: 2, event: "Transfer",        device: "Chrome · Windows",    location: "Lagos, NG",     time: "2026-02-16T14:20:00", success: true  },
  { id: 3, event: "Failed Login",    device: "Firefox · Android",   location: "Abuja, NG",     time: "2026-02-15T22:10:00", success: false },
  { id: 4, event: "Password Change", device: "Chrome · Windows",    location: "Lagos, NG",     time: "2026-02-14T09:30:00", success: true  },
  { id: 5, event: "Login",           device: "Safari · iPhone",     location: "Lagos, NG",     time: "2026-02-12T18:45:00", success: true  },
];

const Security = () => {
  const [twoFA,         setTwoFA]         = useState(false);
  const [twoFAStep,     setTwoFAStep]     = useState("off"); // off | qr | verify | on
  const [verifyCode,    setVerifyCode]    = useState("");
  const [verifyError,   setVerifyError]   = useState("");

  // Transaction PIN state
  const [hasPin, setHasPin] = useState(false); // Would normally check from backend
  const [pinStep, setPinStep] = useState("view"); // view | set | confirm
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const [limits, setLimits]   = useState({ single: 500000, daily: 1000000 });
  const [editLimits, setEditLimits] = useState(false);
  const [draftLimits, setDraftLimits] = useState({ single: 500000, daily: 1000000 });
  const [limitsSaved, setLimitsSaved] = useState(false);

  // ── 2FA handlers ──
  const handle2FAToggle = () => {
    if (twoFA) {
      setTwoFA(false);
      setTwoFAStep("off");
    } else {
      setTwoFAStep("qr");
    }
  };

  const handleVerify2FA = () => {
    if (verifyCode.length !== 6) { setVerifyError("Enter the 6-digit code from your authenticator app."); return; }
    setVerifyError("");
    setTwoFA(true);
    setTwoFAStep("on");
    setVerifyCode("");
  };

  // ── Transaction PIN handlers ──
  const handlePinChange = (e, field) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (field === "new") {
      setNewPin(value);
    } else {
      setConfirmPin(value);
    }
    setPinError("");
  };

  const handleSetPin = async () => {
    if (newPin.length !== 4) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    setPinLoading(true);
    try {
      await setPin(newPin);
      setPinSuccess(true);
      setHasPin(true);
      setPinStep("view");
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => {
        setPinSuccess(false);
      }, 3000);
    } catch (err) {
      setPinError(err.response?.data?.message || "Failed to set PIN");
    } finally {
      setPinLoading(false);
    }
  };

  // ── Limits handlers ──
  const handleLimitsSave = () => {
    if (draftLimits.single > draftLimits.daily) {
      alert("Single transfer limit cannot exceed daily limit.");
      return;
    }
    setLimits(draftLimits);
    setEditLimits(false);
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 3000);
  };

  return (
    <div className="sfa-animate">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0 font-sora">Security</h4>
        <p className="mb-0" style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
          Manage your account security settings
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">

          {/* ── TRANSACTION PIN CARD ── */}
          <div className="sfa-card mb-4 sfa-animate">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 46, height: 46, borderRadius: 14, background: hasPin ? "var(--green-bg)" : "var(--gold-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fas fa-key" style={{ fontSize: "1.25rem", color: hasPin ? "var(--green)" : "var(--gold-dark)" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Transaction PIN</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {hasPin ? "Your account is protected with a PIN" : "Set up a PIN for transfer authorization"}
                  </div>
                </div>
              </div>
              <span className={`sfa-badge ${hasPin ? "sfa-badge-success" : "sfa-badge-silver"}`}>
                {hasPin ? "Set" : "Not Set"}
              </span>
            </div>

            {/* Success message */}
            {pinSuccess && (
              <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                <i className="fas fa-check-circle"></i>
                Transaction PIN set successfully!
              </div>
            )}

            {/* PIN Error message */}
            {pinError && (
              <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--red-bg)", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.85rem", color: "var(--red)" }}>
                <i className="fas fa-exclamation-circle"></i>
                {pinError}
              </div>
            )}

            {/* View PIN status */}
            {pinStep === "view" && (
              <div>
                <div className="sfa-notice mb-3">
                  <i className="fas fa-info-circle" style={{ color: "var(--gold)", flexShrink: 0 }}></i>
                  Your transaction PIN is required to authorize transfers
                </div>
                <button className="sfa-btn-primary" onClick={() => setPinStep("set")}>
                  <i className="fas fa-plus-circle me-2"></i>{hasPin ? "Change PIN" : "Set PIN"}
                </button>
              </div>
            )}

            {/* Set PIN form */}
            {pinStep === "set" && (
              <div className="sfa-animate">
                <div className="mb-3">
                  <label className="sfa-label">Enter 4-digit PIN</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon"><i className="fas fa-lock"></i></span>
                    <input
                      type="password"
                      className="sfa-field"
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => handlePinChange(e, "new")}
                      maxLength={4}
                      autoComplete="off"
                      style={{ letterSpacing: "0.5em", fontWeight: 700, fontSize: "1.2rem" }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="sfa-label">Confirm PIN</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon"><i className="fas fa-lock"></i></span>
                    <input
                      type="password"
                      className="sfa-field"
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => handlePinChange(e, "confirm")}
                      maxLength={4}
                      autoComplete="off"
                      style={{ letterSpacing: "0.5em", fontWeight: 700, fontSize: "1.2rem" }}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="sfa-btn-silver" onClick={() => { setPinStep("view"); setNewPin(""); setConfirmPin(""); setPinError(""); }}>
                    Cancel
                  </button>
                  <button className="sfa-btn-primary flex-grow-1" onClick={handleSetPin} disabled={pinLoading}>
                    {pinLoading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fas fa-check me-2"></i>Save PIN</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 2FA CARD ── */}
          <div className="sfa-card mb-4 sfa-animate">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 46, height: 46, borderRadius: 14, background: twoFA ? "var(--green-bg)" : "var(--gold-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fas fa-shield-alt" style={{ fontSize: "1.25rem", color: twoFA ? "var(--green)" : "var(--gold-dark)" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {twoFA ? "Your account is protected with 2FA" : "Add an extra layer of security"}
                  </div>
                </div>
              </div>
              <span className={`sfa-badge ${twoFA ? "sfa-badge-success" : "sfa-badge-silver"}`}>
                {twoFA ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* ── 2FA states ── */}
            {twoFAStep === "off" && (
              <button className="sfa-btn-primary" onClick={handle2FAToggle}>
                <i className="fas fa-shield-plus me-2"></i>Enable 2FA
              </button>
            )}

            {twoFAStep === "qr" && (
              <div className="sfa-animate">
                <div className="sfa-notice mb-3">
                  <i className="fas fa-info-circle" style={{ color: "var(--gold)", flexShrink: 0 }}></i>
                  Scan the QR code below with Google Authenticator or Authy
                </div>
                {/* Fake QR code */}
                <div className="text-center mb-3">
                  <div style={{ width: 140, height: 140, margin: "0 auto", background: "var(--bg)", border: "2px solid var(--border-gold)", borderRadius: "var(--radius)", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, padding: 12 }}>
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div key={i} style={{ background: Math.random() > 0.5 ? "#1a1508" : "transparent", borderRadius: 2 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>SFA-BANK-{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                </div>
                <div className="mb-3">
                  <label className="sfa-label">Enter 6-digit verification code</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon"><i className="fas fa-key"></i></span>
                    <input
                      type="text" className="sfa-field" maxLength={6}
                      placeholder="000000"
                      value={verifyCode}
                      onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, "")); setVerifyError(""); }}
                      style={{ letterSpacing: "0.3em", fontWeight: 700, fontSize: "1.1rem" }}
                    />
                  </div>
                  {verifyError && <div style={{ fontSize: "0.8rem", color: "var(--red)", marginTop: "0.3rem" }}>{verifyError}</div>}
                </div>
                <div className="d-flex gap-2">
                  <button className="sfa-btn-silver" onClick={() => setTwoFAStep("off")}>Cancel</button>
                  <button className="sfa-btn-primary flex-grow-1" onClick={handleVerify2FA}>
                    <i className="fas fa-check-circle me-2"></i>Verify & Enable
                  </button>
                </div>
              </div>
            )}

            {twoFAStep === "on" && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                  <i className="fas fa-check-circle"></i>
                  2FA is now active on your account
                </div>
                <button className="sfa-btn-outline" style={{ borderColor: "var(--red)", color: "var(--red)" }} onClick={handle2FAToggle}>
                  <i className="fas fa-shield-virus me-2"></i>Disable 2FA
                </button>
              </div>
            )}
          </div>

          {/* ── TRANSACTION LIMITS ── */}
          <div className="sfa-card sfa-animate-delay-1">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--gold-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fas fa-sliders-h" style={{ fontSize: "1.25rem", color: "var(--gold-dark)" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Transaction Limits</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Control your transfer thresholds</div>
                </div>
              </div>
              {!editLimits && (
                <button className="sfa-btn-outline" style={{ padding: "0.35rem 0.9rem", fontSize: "0.82rem" }} onClick={() => { setEditLimits(true); setDraftLimits(limits); }}>
                  <i className="fas fa-pen me-1"></i>Edit
                </button>
              )}
            </div>

            {!editLimits ? (
              <div>
                {[
                  { label: "Single Transfer Limit", value: formatCurrency(limits.single), icon: "fa-exchange-alt" },
                  { label: "Daily Transfer Limit",  value: formatCurrency(limits.daily),  icon: "fa-calendar-check"   },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`fas ${icon}`} style={{ color: "var(--gold-dark)", fontSize: "0.9rem" }}></i>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-3)" }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--gold-dark)" }}>{value}</span>
                  </div>
                ))}
                {limitsSaved && (
                  <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                    <i className="fas fa-check-circle"></i> Limits updated successfully!
                  </div>
                )}
              </div>
            ) : (
              <div>
                {[
                  { label: "Single Transfer Limit (₦)", name: "single" },
                  { label: "Daily Transfer Limit (₦)",  name: "daily"  },
                ].map(({ label, name }) => (
                  <div key={name} className="mb-3">
                    <label className="sfa-label">{label}</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon" style={{ fontWeight: 700, color: "var(--gold-dark)" }}>₦</span>
                      <input
                        type="number" className="sfa-field"
                        value={draftLimits[name]}
                        onChange={(e) => setDraftLimits(p => ({ ...p, [name]: Number(e.target.value) }))}
                        min="1000"
                      />
                    </div>
                  </div>
                ))}
                <div className="d-flex gap-2 mt-2">
                  <button className="sfa-btn-silver" onClick={() => setEditLimits(false)}>Cancel</button>
                  <button className="sfa-btn-primary flex-grow-1" onClick={handleLimitsSave}>
                    <i className="fas fa-check me-2"></i>Save Limits
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Activity log ── */}
        <div className="col-12 col-lg-5">
          <div className="sfa-card">
            <h6 className="font-sora fw-bold mb-3" style={{ fontSize: "0.9rem" }}>
              <i className="fas fa-history me-2" style={{ color: "var(--gold-dark)" }}></i>
              Recent Activity
            </h6>
            <div className="d-flex flex-column gap-2">
              {mockActivity.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: "0.75rem", padding: "0.65rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", alignItems: "flex-start" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: a.success ? "var(--green-bg)" : "var(--red-bg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`fas ${a.success ? "fa-check-circle" : "fa-times-circle"}`}
                      style={{ fontSize: "0.9rem", color: a.success ? "var(--green)" : "var(--red)" }}></i>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{a.event}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{a.device}</div>
                    <div style={{ fontSize: "0.73rem", color: "var(--text-light)", marginTop: 1 }}>
                      <i className="fas fa-map-marker-alt me-1"></i>{a.location} · {formatDate(a.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
