import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const TABS = ["Profile", "Password", "Notifications"];

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");

  // Profile form
  const [profile, setProfile] = useState({
    fullName:    user?.fullName    || "",
    username:    user?.username    || "",
    email:       user?.email       || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [profileLoading,setProfileLoading]= useState(false);

  // Password form
  const [passwords, setPasswords]   = useState({ current: "", newPass: "", confirm: "" });
  const [showPw,    setShowPw]      = useState({ current: false, newPass: false, confirm: false });
  const [pwError,   setPwError]     = useState("");
  const [pwSaved,   setPwSaved]     = useState(false);
  const [pwLoading, setPwLoading]   = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    emailNotifications: true,
    smsNotifications:   true,
    transactionAlerts:  true,
    loginAlerts:        true,
    promotions:         false,
  });
  const [notifSaved,  setNotifSaved]  = useState(false);

  // ── Handlers ──
  const handleProfileSave = () => {
    setProfileLoading(true);
    setTimeout(() => {
      updateUser({ fullName: profile.fullName, phoneNumber: profile.phoneNumber });
      setProfileLoading(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }, 900);
  };

  const handlePasswordSave = () => {
    setPwError("");
    if (!passwords.current)              { setPwError("Enter your current password."); return; }
    if (passwords.newPass.length < 6)    { setPwError("New password must be at least 6 characters."); return; }
    if (passwords.newPass !== passwords.confirm) { setPwError("New passwords do not match."); return; }
    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwSaved(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    }, 900);
  };

  const handleNotifSave = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="d-flex justify-content-between align-items-center py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <div>
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{label}</div>
        {desc && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
          background: checked ? "var(--gold)" : "var(--silver-light)",
          position: "relative", transition: "background 0.25s ease", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: "50%",
          background: "white", transition: "left 0.25s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }} />
      </button>
    </div>
  );

  return (
    <div className="sfa-animate">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0 font-sora">Settings</h4>
        <p className="mb-0" style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
          Manage your profile, password and preferences
        </p>
      </div>

      <div className="row g-4">

        {/* ── Left: Tab nav ── */}
        <div className="col-12 col-md-3">
          <div className="sfa-card p-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  width: "100%", padding: "0.65rem 0.9rem",
                  border: "none", borderRadius: "var(--radius-sm)",
                  background: activeTab === tab ? "var(--gold-bg)" : "transparent",
                  color: activeTab === tab ? "var(--gold-dark)" : "var(--text-muted)",
                  fontWeight: activeTab === tab ? 700 : 500,
                  fontSize: "0.88rem", cursor: "pointer",
                  transition: "all 0.15s ease", textAlign: "left",
                  marginBottom: "0.15rem",
                }}
              >
                <i className={`fas ${
                  tab === "Profile"       ? "fa-user"    :
                  tab === "Password"      ? "fa-lock"      :
                  "fa-bell"
                }`} style={{ fontSize: "0.95rem" }}></i>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Tab content ── */}
        <div className="col-12 col-md-9">

          {/* ── PROFILE TAB ── */}
          {activeTab === "Profile" && (
            <div className="sfa-card sfa-animate">
              {/* Avatar */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold-light))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem", fontWeight: 800, color: "var(--gold-deep)",
                  border: "3px solid var(--gold-lighter)", flexShrink: 0,
                }}>
                  {profile.fullName?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>{profile.fullName || profile.username}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{profile.email}</div>
                  <button style={{ fontSize: "0.8rem", color: "var(--gold-dark)", background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 600, marginTop: "0.25rem" }}>
                    Change photo
                  </button>
                </div>
              </div>

              <div className="row g-3">
                {[
                  { label: "Full Name",    name: "fullName",    type: "text",  icon: "fa-user",      editable: true  },
                  { label: "Username",     name: "username",    type: "text",  icon: "fa-at",          editable: false },
                  { label: "Email",        name: "email",       type: "email", icon: "fa-envelope",    editable: false },
                  { label: "Phone Number", name: "phoneNumber", type: "tel",   icon: "fa-phone",       editable: true  },
                ].map(({ label, name, type, icon, editable }) => (
                  <div key={name} className="col-12 col-sm-6">
                    <label className="sfa-label">{label}</label>
                    <div className="sfa-input-group" style={!editable ? { background: "var(--bg)", opacity: 0.7 } : {}}>
                      <span className="sfa-input-icon"><i className={`fas ${icon}`}></i></span>
                      <input
                        type={type}
                        className="sfa-field"
                        value={profile[name]}
                        disabled={!editable}
                        onChange={(e) => setProfile(p => ({ ...p, [name]: e.target.value }))}
                      />
                      {!editable && (
                        <span style={{ padding: "0 0.75rem" }}>
                          <i className="fas fa-lock" style={{ fontSize: "0.8rem", color: "var(--text-light)" }}></i>
                        </span>
                      )}
                    </div>
                    {!editable && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-light)", marginTop: "0.25rem" }}>Cannot be changed</div>
                    )}
                  </div>
                ))}
              </div>

              {profileSaved && (
                <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                  <i className="fas fa-check-circle"></i> Profile updated successfully!
                </div>
              )}

              <button className="sfa-btn-primary mt-4" onClick={handleProfileSave} disabled={profileLoading}>
                {profileLoading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fas fa-check me-2"></i>Save Changes</>}
              </button>
            </div>
          )}

          {/* ── PASSWORD TAB ── */}
          {activeTab === "Password" && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-1" style={{ fontSize: "0.95rem" }}>Change Password</h6>
              <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Choose a strong password with at least 6 characters
              </p>

              {pwError && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--red-bg)", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.85rem", color: "var(--red)" }}>
                  <i className="fas fa-exclamation-circle flex-shrink-0"></i> {pwError}
                </div>
              )}

              {[
                { label: "Current Password",  name: "current" },
                { label: "New Password",       name: "newPass"  },
                { label: "Confirm New Password",name: "confirm" },
              ].map(({ label, name }) => (
                <div key={name} className="mb-3">
                  <label className="sfa-label">{label}</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon"><i className="fas fa-lock"></i></span>
                    <input
                      type={showPw[name] ? "text" : "password"}
                      className="sfa-field"
                      placeholder="••••••••"
                      value={passwords[name]}
                      onChange={(e) => { setPasswords(p => ({ ...p, [name]: e.target.value })); setPwError(""); }}
                    />
                    <button className="sfa-input-toggle" onClick={() => setShowPw(p => ({ ...p, [name]: !p[name] }))}>
                      <i className={`fas ${showPw[name] ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>
              ))}

              {pwSaved && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                  <i className="fas fa-check-circle"></i> Password changed successfully!
                </div>
              )}

              <button className="sfa-btn-primary mt-2" onClick={handlePasswordSave} disabled={pwLoading}>
                {pwLoading ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : <><i className="fas fa-shield-alt me-2"></i>Update Password</>}
              </button>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "Notifications" && (
            <div className="sfa-card sfa-animate">
              <h6 className="font-sora fw-bold mb-1" style={{ fontSize: "0.95rem" }}>Notification Preferences</h6>
              <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Choose how you want to be notified
              </p>

              <Toggle checked={notifs.emailNotifications} onChange={v => setNotifs(p => ({ ...p, emailNotifications: v }))} label="Email Notifications" desc="Get transaction receipts and alerts via email" />
              <Toggle checked={notifs.smsNotifications}   onChange={v => setNotifs(p => ({ ...p, smsNotifications: v }))}   label="SMS Notifications"   desc="Receive SMS alerts on your registered number" />
              <Toggle checked={notifs.transactionAlerts}  onChange={v => setNotifs(p => ({ ...p, transactionAlerts: v }))}  label="Transaction Alerts"  desc="Get notified on every debit and credit" />
              <Toggle checked={notifs.loginAlerts}        onChange={v => setNotifs(p => ({ ...p, loginAlerts: v }))}        label="Login Alerts"        desc="Be notified when someone logs into your account" />
              <Toggle checked={notifs.promotions}         onChange={v => setNotifs(p => ({ ...p, promotions: v }))}         label="Promotional Updates" desc="News, offers and product updates from SFA Bank" />

              {notifSaved && (
                <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" style={{ background: "var(--green-bg)", border: "1px solid rgba(46,158,107,0.2)", fontSize: "0.85rem", color: "var(--green)" }}>
                  <i className="fas fa-check-circle"></i> Preferences saved!
                </div>
              )}

              <button className="sfa-btn-primary mt-4" onClick={handleNotifSave}>
                <i className="fas fa-check me-2"></i>Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
