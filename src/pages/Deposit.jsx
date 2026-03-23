import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { depositAccount, fetchAccounts } from "../services/accountService";
import { formatCurrency } from "../utils/formatCurrency";
import { Link } from "react-router-dom";

const Deposit = () => {
  const { token, loading } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Payment method: "card" | "paystack" | "flutterwave"
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Card details (mock)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UI state
  const [step, setStep] = useState(1); // 1 = method select, 2 = details, 3 = success
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    if (!loading && token) {
      fetchAccounts().then(setAccounts).catch(console.error);
    }
  }, [token, loading]);

  const formatCardNumber = (val) => {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  const getCardBrand = () => {
    const n = cardNumber.replace(/\s/g, "");
    if (n.startsWith("4")) return "VISA";
    if (n.startsWith("5")) return "MASTERCARD";
    if (n.startsWith("3")) return "AMEX";
    return "";
  };

  const handleDeposit = async () => {
    if (!selectedAccount) {
      setMessage("Please select an account");
      setMessageType("error");
      return;
    }
    if (!amount || Number(amount) < 100) {
      setMessage("Minimum deposit amount is ₦100");
      setMessageType("error");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        setMessage("Please enter a valid 16-digit card number");
        setMessageType("error");
        return;
      }
      if (!cardName) {
        setMessage("Please enter the cardholder name");
        setMessageType("error");
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setMessage("Please enter a valid expiry date");
        setMessageType("error");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setMessage("Please enter a valid CVV");
        setMessageType("error");
        return;
      }
    }

    setSubmitting(true);
    setMessage("");

    // Simulate processing delay for mock
    await new Promise((res) => setTimeout(res, 2200));

    try {
      const res = await depositAccount(selectedAccount, amount);
      setMessage(res.message || "Deposit successful!");
      setMessageType("success");
      setStep(3);
      const updatedAccounts = await fetchAccounts();
      setAccounts(updatedAccounts);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Deposit failed. Try again.";
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAmount("");
    setSelectedAccount("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setMessage("");
    setPaymentMethod("card");
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  /* ── Styles ── */
  const gold = "#C9A24C";
  const goldFaint = "rgba(201,162,76,0.12)";
  const goldBorder = "rgba(201,162,76,0.28)";

  const s = {
    page: { maxWidth: 560, margin: "0 auto" },
    card: {
      background: "#fff",
      border: `1px solid ${goldBorder}`,
      borderRadius: 18,
      padding: "2.2rem",
      boxShadow: "0 6px 32px rgba(201,162,76,0.09)",
    },
    label: {
      display: "block",
      fontSize: "0.67rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: gold,
      marginBottom: "0.45rem",
      fontWeight: 700,
    },
    input: {
      width: "100%",
      background: "#fafafa",
      border: `1px solid ${goldBorder}`,
      borderRadius: 10,
      color: "#222",
      padding: "0.72rem 1rem",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      background: "#fafafa",
      border: `1px solid ${goldBorder}`,
      borderRadius: 10,
      overflow: "hidden",
    },
    inputIcon: {
      padding: "0 0.85rem",
      color: gold,
      borderRight: `1px solid ${goldBorder}`,
      fontSize: "0.9rem",
    },
    inlineInput: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "#222",
      padding: "0.72rem 1rem",
      fontSize: "0.9rem",
    },
    hint: { fontSize: "0.73rem", color: "#aaa", marginTop: "0.35rem" },
    select: {
      width: "100%",
      background: "#fafafa",
      border: `1px solid ${goldBorder}`,
      borderRadius: 10,
      color: "#333",
      padding: "0.72rem 1rem",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
    },
    alertSuccess: {
      background: "rgba(201,162,76,0.08)",
      border: `1px solid ${goldBorder}`,
      borderRadius: 10,
      color: "#a07a28",
      padding: "0.75rem 1rem",
      fontSize: "0.84rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    alertError: {
      background: "rgba(220,53,69,0.06)",
      border: "1px solid rgba(220,53,69,0.25)",
      borderRadius: 10,
      color: "#dc3545",
      padding: "0.75rem 1rem",
      fontSize: "0.84rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
  };

  /* ── Payment Method Tab ── */
  const MethodTab = ({ id, icon, label, sub }) => {
    const active = paymentMethod === id;
    return (
      <button
        onClick={() => { setPaymentMethod(id); setMessage(""); }}
        style={{
          flex: 1,
          background: active ? goldFaint : "transparent",
          border: active ? `1.5px solid ${gold}` : `1.5px solid ${goldBorder}`,
          borderRadius: 12,
          padding: "0.85rem 0.5rem",
          cursor: "pointer",
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: active ? gold : "#555" }}>{label}</span>
        <span style={{ fontSize: "0.65rem", color: "#aaa" }}>{sub}</span>
      </button>
    );
  };

  /* ── Visual Credit Card Preview ── */
  const CardPreview = () => {
    const brand = getCardBrand();
    const displayNum = cardNumber || "•••• •••• •••• ••••";
    const displayName = cardName || "CARDHOLDER NAME";
    const displayExpiry = cardExpiry || "MM/YY";

    return (
      <div
        style={{
          perspective: 1000,
          marginBottom: "1.75rem",
          cursor: "pointer",
        }}
        onClick={() => setCardFlipped((f) => !f)}
        title="Click to flip"
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 170,
            transformStyle: "preserve-3d",
            transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
            transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              borderRadius: 16,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2e2410 60%, #1a1a1a 100%)",
              padding: "1.4rem 1.6rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            {/* shimmer ring */}
            <div style={{
              position: "absolute", right: -40, top: -40,
              width: 160, height: 160,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,162,76,0.18) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", left: -30, bottom: -30,
              width: 120, height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,162,76,0.10) 0%, transparent 70%)",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* chip */}
              <div style={{
                width: 38, height: 28, borderRadius: 5,
                background: "linear-gradient(135deg, #c9a24c 0%, #f0d080 50%, #a07828 100%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }} />
              <span style={{ color: gold, fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.12em" }}>
                {brand || "SFA"}
              </span>
            </div>

            <div style={{ color: "#e8d9b5", fontSize: "1.15rem", letterSpacing: "0.22em", fontFamily: "monospace" }}>
              {displayNum}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#888", letterSpacing: "0.15em", marginBottom: 2 }}>CARDHOLDER</div>
                <div style={{ color: "#e8d9b5", fontSize: "0.82rem", letterSpacing: "0.1em", fontWeight: 600 }}>
                  {displayName.toUpperCase().slice(0, 22)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.55rem", color: "#888", letterSpacing: "0.15em", marginBottom: 2 }}>EXPIRES</div>
                <div style={{ color: "#e8d9b5", fontSize: "0.82rem", letterSpacing: "0.1em" }}>{displayExpiry}</div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 16,
              background: "linear-gradient(135deg, #1a1a1a 0%, #2e2410 60%, #1a1a1a 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* magnetic strip */}
            <div style={{ width: "100%", height: 40, background: "#111", margin: "0 0 1.2rem" }} />
            <div style={{ padding: "0 1.6rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{ flex: 1, height: 36, background: "#f5f5f5", borderRadius: 4 }} />
              <div style={{
                width: 54, height: 36, background: "#fff8ee",
                border: `1px solid ${goldBorder}`, borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "monospace", fontSize: "0.9rem", color: "#333", letterSpacing: "0.1em",
              }}>
                {cardCvv || "•••"}
              </div>
            </div>
            <div style={{ padding: "0.7rem 1.6rem 0", fontSize: "0.6rem", color: "#555", textAlign: "center" }}>
              This card is issued by SFA Bank • Mock card for demo purposes only
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.68rem", color: "#bbb" }}>
          Click card to flip
        </div>
      </div>
    );
  };

  /* ── Third-party mock modal ── */
  const ThirdPartyMock = ({ provider }) => {
    const isPaystack = provider === "paystack";
    const color = isPaystack ? "#011B33" : "#F5A623";
    const accent = isPaystack ? "#00C3F7" : "#F5A623";
    return (
      <div style={{
        background: "#fff",
        border: `2px solid ${accent}`,
        borderRadius: 16,
        padding: "1.75rem",
        marginBottom: "1.5rem",
        boxShadow: `0 4px 24px ${isPaystack ? "rgba(0,195,247,0.10)" : "rgba(245,166,35,0.12)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: color, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className={`fas ${isPaystack ? "fa-bolt" : "fa-feather-alt"}`} style={{ color: accent, fontSize: "1rem" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: color }}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</div>
            <div style={{ fontSize: "0.7rem", color: "#aaa" }}>Secure payment gateway</div>
          </div>
          <span style={{
            marginLeft: "auto", fontSize: "0.65rem", background: "#eafaf1",
            color: "#27ae60", border: "1px solid #b7e4c7", borderRadius: 20, padding: "2px 10px",
          }}>MOCK</span>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputGroup}>
            <span style={s.inputIcon}><i className="fas fa-envelope" /></span>
            <input style={s.inlineInput} placeholder="your@email.com" type="email" />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Card Number</label>
          <div style={s.inputGroup}>
            <span style={s.inputIcon}><i className="fas fa-credit-card" /></span>
            <input style={s.inlineInput} placeholder="0000 0000 0000 0000" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Expiry</label>
            <input style={s.input} placeholder="MM/YY" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>CVV</label>
            <input style={s.input} placeholder="•••" type="password" maxLength={4} />
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          fontSize: "0.7rem", color: "#aaa", marginTop: "0.75rem",
        }}>
          <i className="fas fa-lock" style={{ color: accent }} />
          Payments secured by {provider.charAt(0).toUpperCase() + provider.slice(1)} — demo mode only
        </div>
      </div>
    );
  };

  /* ── Success State ── */
  if (step === 3) {
    return (
      <div className="sfa-page-content">
        <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(201,162,76,0.12)",
            border: `2px solid ${gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
            animation: "pulse 1.5s ease infinite",
          }}>
            <i className="fas fa-check" style={{ color: gold, fontSize: "1.8rem" }} />
          </div>
          <h4 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#080808", marginBottom: "0.5rem" }}>
            Deposit Successful!
          </h4>
          <p style={{ color: "#888", fontSize: "0.88rem", marginBottom: "0.25rem" }}>
            ₦{Number(amount).toLocaleString()} has been added to your account.
          </p>
          <p style={{ color: "#bbb", fontSize: "0.75rem", marginBottom: "2rem" }}>
            via {paymentMethod === "card" ? "Direct Card" : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={resetForm}
              style={{
                background: gold, border: "none", borderRadius: 10,
                color: "#080808", fontWeight: 700, fontSize: "0.85rem",
                padding: "0.75rem 1.5rem", cursor: "pointer",
              }}
            >
              New Deposit
            </button>
            <Link
              to="/accounts"
              style={{
                background: "transparent", border: `1px solid ${goldBorder}`,
                borderRadius: 10, color: "#555", fontWeight: 600, fontSize: "0.85rem",
                padding: "0.75rem 1.5rem", textDecoration: "none",
                display: "inline-flex", alignItems: "center",
              }}
            >
              View Accounts
            </Link>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,162,76,0.3)} 50%{box-shadow:0 0 0 12px rgba(201,162,76,0)} }`}</style>
      </div>
    );
  }

  const isDisabled =
    submitting ||
    !selectedAccount ||
    !amount ||
    (paymentMethod === "card" && (!cardNumber || !cardName || !cardExpiry || !cardCvv));

  return (
    <div className="sfa-page-content">
      <style>{`
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input:focus, select:focus { border-color: ${gold} !important; box-shadow: 0 0 0 3px rgba(201,162,76,0.12) !important; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .dep-section { animation: fadeIn 0.25s ease; }
      `}</style>

      <Link
        to="/accounts"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          color: "#888", textDecoration: "none", fontSize: "0.82rem", marginBottom: "1.5rem",
        }}
      >
        <i className="fas fa-arrow-left" /> Back to Accounts
      </Link>

      <div style={s.card}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: goldFaint, border: `1px solid ${goldBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
          }}>
            <i className="fas fa-arrow-down" style={{ color: gold, fontSize: "1.1rem" }} />
          </div>
          <h4 style={{ color: "#080808", fontWeight: 800, fontSize: "1.35rem", marginBottom: "0.2rem" }}>
            Deposit Funds
          </h4>
          <p style={{ color: "#888", fontSize: "0.83rem", margin: 0 }}>
            Add money to your SFA Bank account
          </p>
        </div>

        {/* Account + Amount */}
        <div className="dep-section" style={{ marginBottom: "1.2rem" }}>
          <label style={s.label}>Select Account</label>
          <select style={s.select} value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
            <option value="">Choose account...</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc.accountNumber}>
                {acc.accountType?.charAt(0).toUpperCase() + acc.accountType?.slice(1)}
                {" — "}{acc.accountNumber}{" | "}{formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        <div className="dep-section" style={{ marginBottom: "1.5rem" }}>
          <label style={s.label}>Amount (₦)</label>
          <div style={s.inputGroup}>
            <span style={s.inputIcon}><i className="fas fa-money-bill-wave" /></span>
            <input
              type="number"
              style={s.inlineInput}
              placeholder="Enter amount (min ₦100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />
          </div>
          <div style={s.hint}>Minimum deposit: ₦100</div>
        </div>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.2rem", color: "#ccc", fontSize: "0.72rem", letterSpacing: "0.12em",
        }}>
          <div style={{ flex: 1, height: 1, background: goldBorder }} />
          PAYMENT METHOD
          <div style={{ flex: 1, height: 1, background: goldBorder }} />
        </div>

        {/* Payment Method Tabs */}
        <div className="dep-section" style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <MethodTab id="card" icon="💳" label="Debit Card" sub="Instant" />
          <MethodTab id="paystack" icon="⚡" label="Paystack" sub="Gateway" />
          <MethodTab id="flutterwave" icon="🌊" label="Flutterwave" sub="Gateway" />
        </div>

        {/* Card Details */}
        {paymentMethod === "card" && (
          <div className="dep-section">
            <CardPreview />
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Card Number</label>
              <div style={s.inputGroup}>
                <span style={s.inputIcon}><i className="fas fa-credit-card" /></span>
                <input
                  style={s.inlineInput}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
                {getCardBrand() && (
                  <span style={{ paddingRight: "0.85rem", fontSize: "0.7rem", fontWeight: 800, color: gold }}>
                    {getCardBrand()}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Cardholder Name</label>
              <input
                style={s.input}
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Expiry Date</label>
                <input
                  style={s.input}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  onFocus={() => setCardFlipped(false)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>CVV</label>
                <input
                  style={s.input}
                  placeholder="•••"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  onFocus={() => setCardFlipped(true)}
                  onBlur={() => setCardFlipped(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paystack mock */}
        {paymentMethod === "paystack" && (
          <div className="dep-section">
            <ThirdPartyMock provider="paystack" />
          </div>
        )}

        {/* Flutterwave mock */}
        {paymentMethod === "flutterwave" && (
          <div className="dep-section">
            <ThirdPartyMock provider="flutterwave" />
          </div>
        )}

        {/* Alert */}
        {message && (
          <div style={messageType === "success" ? s.alertSuccess : s.alertError}>
            <i className={`fas fa-${messageType === "success" ? "check-circle" : "exclamation-circle"}`} />
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleDeposit}
          disabled={isDisabled}
          style={{
            width: "100%",
            background: isDisabled ? "rgba(201,162,76,0.3)" : gold,
            border: "none",
            borderRadius: 10,
            color: isDisabled ? "rgba(8,8,8,0.35)" : "#080808",
            fontWeight: 800,
            fontSize: "0.88rem",
            letterSpacing: "0.08em",
            padding: "0.9rem",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s",
          }}
          onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {submitting ? (
            <><i className="fas fa-spinner fa-spin me-2" />Processing Payment...</>
          ) : (
            <><i className="fas fa-lock me-2" />
              Deposit ₦{amount ? Number(amount).toLocaleString() : "—"} Now
            </>
          )}
        </button>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${goldBorder}`,
          marginTop: "1.4rem",
          paddingTop: "0.9rem",
          textAlign: "center",
          color: "#bbb",
          fontSize: "0.7rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}>
          <i className="fas fa-shield-alt" style={{ color: gold }} />
          Secured &amp; Encrypted • All transactions are mock/demo only
        </div>
      </div>
    </div>
  );
};

export default Deposit;