import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill"    },
  { to: "/accounts",  label: "Accounts",  icon: "bi-wallet2"           },
  { to: "/transfer",  label: "Transfer",  icon: "bi-arrow-left-right"  },
  { to: "/bills",     label: "Bills",     icon: "bi-receipt-cutoff"    },
  { to: "/settings",  label: "Settings",  icon: "bi-gear-fill"         },
  { to: "/security",  label: "Security",  icon: "bi-shield-lock-fill"  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
     
      <div
        className={`sfa-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      
      <aside className={`sfa-sidebar ${isOpen ? "open" : ""}`}>

       
        <div className="sfa-sidebar-brand">
          <div className="sfa-sidebar-logo">
            <i className="bi bi-bank2"></i>
          </div>
          <div>
            <div className="sfa-sidebar-name">SFA Bank</div>
            <div className="sfa-sidebar-tagline">Digital Banking</div>
          </div>
        </div>

       
        <nav className="flex-grow-1 overflow-auto" style={{ paddingBottom: "1rem" }}>
          <div className="sfa-nav-label">Main Menu</div>

          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sfa-nav-item ${isActive ? "active" : ""}`
              }
              onClick={onClose} 
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: "0.85rem" }}>
         
          <div style={{ padding: "0.5rem 1.1rem 0.75rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 700,
                color: "var(--gold-deep)", flexShrink: 0,
                border: "2px solid rgba(201,168,76,0.3)",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.fullName || user?.username || "User"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(201,168,76,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email || ""}
              </div>
            </div>
          </div>

          
          <button type="button" className="sfa-nav-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;