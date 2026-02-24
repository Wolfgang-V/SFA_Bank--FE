import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); 

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
      { level: 0, label: "", color: "" },
      { level: 1, label: "Weak", color: "danger" },
      { level: 2, label: "Fair", color: "warning" },
      { level: 3, label: "Good", color: "info" },
      { level: 4, label: "Strong", color: "success" },
    ];
    return map[score];
  };

  const strength = getPasswordStrength(formData.password);

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.username.trim()) return "Username is required.";
    if (formData.username.length < 3) return "Username must be at least 3 characters.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Please enter a valid email.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.password) return "Password is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      const data = await registerUser(formData);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sfa-auth-wrapper">
      <div className="sfa-auth-bg-pattern" />

      <div className="container py-4">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

            <div className="sfa-auth-card">

              
              <div className="text-center mb-4">
                <div className="sfa-auth-logo mx-auto mb-3">
                  <i className="bi bi-bank2"></i>
                </div>
                <h1 className="sfa-auth-title">Create account</h1>
                <p className="sfa-auth-subtitle">Join SFA Bank — your money, secured</p>
              </div>

             
              <div className="sfa-steps mb-4">
                <div className={`sfa-step ${step >= 1 ? "active" : ""}`}>
                  <div className="sfa-step-dot">1</div>
                  <span>Personal Info</span>
                </div>
                <div className="sfa-step-line" />
                <div className={`sfa-step ${step >= 2 ? "active" : ""}`}>
                  <div className="sfa-step-dot">2</div>
                  <span>Security</span>
                </div>
              </div>

             
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                  <small>{error}</small>
                </div>
              )}

             
              {step === 1 && (
                <div>
                  <div className="mb-3">
                    <label className="sfa-label">Full Name</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-person"></i></span>
                      <input
                        type="text" name="fullName" className="sfa-field"
                        placeholder="John Doe"
                        value={formData.fullName} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="sfa-label">Username</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-at"></i></span>
                      <input
                        type="text" name="username" className="sfa-field"
                        placeholder="johndoe"
                        value={formData.username} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="sfa-label">Email Address</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email" name="email" className="sfa-field"
                        placeholder="you@example.com"
                        value={formData.email} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="sfa-label">
                      Phone Number <span className="text-muted">(optional)</span>
                    </label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-phone"></i></span>
                      <input
                        type="tel" name="phoneNumber" className="sfa-field"
                        placeholder="08133944036"
                        value={formData.phoneNumber} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn sfa-btn-primary w-100"
                    onClick={handleNext}
                  >
                    Continue
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              )}

              
              {step === 2 && (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="sfa-label">Password</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-lock"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password" className="sfa-field"
                        placeholder="Min. 6 characters"
                        value={formData.password} onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button" className="sfa-input-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>

                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="sfa-strength-bar"
                              style={{
                                backgroundColor:
                                  i <= strength.level
                                    ? `var(--bs-${strength.color})`
                                    : "#e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                        {strength.label && (
                          <small className={`text-${strength.color}`}>
                            {strength.label} password
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="sfa-label">Confirm Password</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon"><i className="bi bi-lock-fill"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword" className="sfa-field"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword} onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                   
                    {formData.confirmPassword && (
                      <small className={formData.password === formData.confirmPassword ? "text-success" : "text-danger"}>
                        <i className={`bi me-1 ${formData.password === formData.confirmPassword ? "bi-check-circle" : "bi-x-circle"}`}></i>
                        {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                      </small>
                    )}
                  </div>

                
                  <div className="sfa-notice mb-4">
                    <i className="bi bi-gift-fill text-success me-2"></i>
                    <span>Your account will be credited with <strong>₦100,000</strong> on creation!</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn sfa-btn-outline"
                      style={{ width: "40%" }}
                      onClick={() => { setStep(1); setError(""); }}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                    <button
                      type="submit"
                      className="btn sfa-btn-primary flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i>Create Account</>
                      )}
                    </button>
                  </div>
                </form>
              )}

             
              <div className="sfa-divider my-4">
                <span>Already have an account?</span>
              </div>
              <Link to="/login" className="btn sfa-btn-outline w-100">
                Sign in instead
              </Link>
            </div>

            <p className="text-center mt-4 sfa-footer-note">
              <i className="bi bi-shield-lock me-1"></i>
              Secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
