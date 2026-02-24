import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuToggle, menuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayFirstName = user && typeof user.fullName === "string"
    ? user.fullName.split(" ")[0]
    : user?.username || "User";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="sfa-navbar">
       
        <button
          type="button"
          className={`sfa-hamburger ${menuOpen ? "open" : ""}`}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <div className="sfa-landing-logo-icon" style={{ width: 28, height: 28, fontSize: "0.85rem" }}>
            <i className="bi bi-bank2"></i>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--gold-dark)" }}>
            SFA Bank
          </span>
        </div>

     
        <div className="flex-grow-1" />

        
        <div className="d-flex align-items-center gap-2">

         
          <button type="button" className="sfa-nav-bell" title="Notifications">
            <i className="bi bi-bell" style={{ fontSize: "1rem" }}></i>
            <span
              style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8,
                background: "var(--gold)",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />
          </button>

          
          <div className="position-relative">
            <button
              type="button"
              className="d-flex align-items-center gap-2 border-0 bg-transparent"
              style={{ cursor: "pointer", padding: "4px 6px", borderRadius: "var(--radius-sm)" }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="sfa-nav-avatar">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="d-none d-md-block text-start">
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
                  {displayFirstName}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1 }}>
                  {user?.email || ""}
                </div>
              </div>
              <i
                className={`bi bi-chevron-down d-none d-md-block`}
                style={{ fontSize: "0.7rem", color: "var(--text-muted)", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>

           
            {dropdownOpen && (
              <>
               
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 98 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "white",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-md)",
                    minWidth: 200,
                    zIndex: 99,
                    overflow: "hidden",
                    animation: "fadeInUp 0.18s ease",
                  }}
                >
                  {/* User info header */}
                  <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
                      {user?.fullName || user?.username}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {user?.email}
                    </div>
                  </div>

                  {[
                    { to: "/dashboard", icon: "bi-grid-1x2",     label: "Dashboard"  },
                    { to: "/settings",  icon: "bi-person-circle", label: "Profile"    },
                    { to: "/security",  icon: "bi-shield-lock",   label: "Security"   },
                  ].map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.65rem",
                        padding: "0.6rem 1rem",
                        fontSize: "0.86rem", fontWeight: 500,
                        color: "var(--text-3)",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--gold-bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <i className={`bi ${icon}`} style={{ color: "var(--gold-dark)", fontSize: "0.9rem" }}></i>
                      {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.65rem",
                      padding: "0.6rem 1rem", width: "100%",
                      fontSize: "0.86rem", fontWeight: 500,
                      color: "var(--red)", background: "none", border: "none",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--red-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <i className="bi bi-box-arrow-right" style={{ fontSize: "0.9rem" }}></i>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;