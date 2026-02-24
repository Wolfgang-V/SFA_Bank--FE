import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "bi-arrow-left-right", title: "Instant Transfers", desc: "Send money to any account in seconds, 24/7." },
  { icon: "bi-receipt-cutoff",   title: "Bill Payments",    desc: "Pay electricity, internet, cable and more from one place." },
  { icon: "bi-shield-lock-fill", title: "Bank-Grade Security", desc: "2FA, transaction limits, and account lockout protection." },
  { icon: "bi-graph-up-arrow",   title: "Transaction History", desc: "Full history of every transaction with search and filters." },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  return (
    <div className="sfa-landing">

     
      <nav className="sfa-landing-nav">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <div className="sfa-landing-logo-icon">
              <i className="bi bi-bank2"></i>
            </div>
            <span className="sfa-landing-brand">SFA Bank</span>
          </div>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn sfa-btn-ghost">Sign In</Link>
            <Link to="/register" className="btn sfa-btn-primary-sm">Get Started</Link>
          </div>
        </div>
      </nav>

     
      <section className="sfa-hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 sfa-hero-content">
              <div className="sfa-hero-badge mb-3">
                <i className="bi bi-stars me-1"></i> Modern Digital Banking
              </div>
              <h1 className="sfa-hero-title">
                Banking that<br />
                <span className="sfa-hero-accent">works for you</span>
              </h1>
              <p className="sfa-hero-desc">
                Manage your money, make transfers, pay bills, and track every transaction —
                all from one secure platform.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/register" className="btn sfa-btn-primary sfa-btn-lg">
                  Open Free Account
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/login" className="btn sfa-btn-ghost sfa-btn-lg">
                  Sign In
                </Link>
              </div>
              
              <div className="sfa-trust mt-4">
                <div className="sfa-trust-item">
                  <i className="bi bi-shield-check text-success"></i>
                  <span> Secured Banking</span>
                </div>
                <div className="sfa-trust-item">
                  <i className="bi bi-gift text-warning"></i>
                  <span>₦100k Starter Bonus</span>
                </div>
                <div className="sfa-trust-item">
                  <i className="bi bi-clock text-info"></i>
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>

           
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div className="sfa-hero-mockup">
                <div className="sfa-mock-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>SAVINGS ACCOUNT</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Cole Palmer</div>
                    </div>
                    <i className="bi bi-bank2" style={{ fontSize: "1.4rem" }}></i>
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: "0.25rem" }}>AVAILABLE BALANCE</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>₦100,000.00</div>
                  <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", opacity: 0.8 }}>
                    2211 •••• •••• 7890
                  </div>
                </div>

               
                <div className="sfa-mock-transactions">
                  {[
                    { icon: "bi-arrow-down-circle-fill", label: "Starter Bonus", amount: "+₦100,000", color: "#22c55e" },
                    { icon: "bi-receipt-cutoff",         label: "DSTV Payment",  amount: "-₦35,000",   color: "#ef4444" },
                    { icon: "bi-arrow-left-right",       label: "Transfer",      amount: "-₦10,000",  color: "#ef4444" },
                     { icon: "bi-arrow-left-right",      label: "Sportybet",      amount:"-₦5,000",  color: "#ef4444" },
                  ].map((tx, i) => (
                    <div key={i} className="sfa-mock-tx">
                      <i className={`bi ${tx.icon}`} style={{ color: tx.color }}></i>
                      <span className="flex-grow-1">{tx.label}</span>
                      <span style={{ color: tx.color, fontWeight: 600, fontSize: "0.85rem" }}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <section className="sfa-features py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="sfa-section-title">Everything you need</h2>
            <p className="sfa-section-sub">Powerful banking features in one place</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-sm-6 col-lg-3">
                <div className="sfa-feature-card h-100">
                  <div className="sfa-feature-icon mb-3">
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h5 className="sfa-feature-title">{f.title}</h5>
                  <p className="sfa-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="sfa-cta py-5">
        <div className="container text-center py-4">
          <h2 className="sfa-cta-title">Ready to get started?</h2>
          <p className="sfa-cta-sub mb-4">Create your account in under 2 minutes</p>
          <Link to="/register" className="btn sfa-btn-primary sfa-btn-lg">
            Open Your Free Account
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

     \
      <footer className="sfa-landing-footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-bank2"></i>
            <span className="fw-semibold">SFA Bank</span>
          </div>
          <small style={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} SFA Bank. All rights reserved.
          </small>
          <div className="d-flex align-items-center gap-1" style={{ opacity: 0.6, fontSize: "0.8rem" }}>
            <i className="bi bi-shield-lock me-1"></i> wG Inc. | 1969 Main St, Knowhere |
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
