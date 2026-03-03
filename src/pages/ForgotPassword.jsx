import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEmail = () => {
    if (!formData.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Please enter a valid email.";
    return null;
  };

  const validateReset = () => {
    if (!formData.otp.trim()) return "OTP is required.";
    if (formData.otp.length !== 4) return "OTP must be 4 digits.";
    if (!formData.newPassword) return "New password is required.";
    if (formData.newPassword.length < 6) return "Password must be at least 6 characters.";
    if (formData.newPassword !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const err = validateEmail();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      const data = await forgotPassword(formData.email);
      setSuccess(data.message || "OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const err = validateReset();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sfa-auth-wrapper">
      <div className="sfa-auth-bg-pattern" />

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

            <div className="sfa-auth-card">

              <div className="text-center mb-4">
                <div className="sfa-auth-logo mx-auto mb-3">
                  <i className="fas fa-university"></i>
                </div>
                <h1 className="sfa-auth-title">
                  {step === 1 ? "Reset your password" : "Enter OTP"}
                </h1>
                <p className="sfa-auth-subtitle">
                  {step === 1 
                    ? "Enter your email to receive a reset code" 
                    : "Check your email for the 4-digit OTP"}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert">
                  <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                  <small>{error}</small>
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" role="alert">
                  <i className="fas fa-check-circle flex-shrink-0"></i>
                  <small>{success}</small>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleRequestOTP} noValidate>
                  <div className="mb-4">
                    <label className="sfa-label" htmlFor="email">Email address</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="sfa-field"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn sfa-btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleResetPassword} noValidate>
                  <div className="mb-3">
                    <label className="sfa-label" htmlFor="otp">4-Digit OTP</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        id="otp"
                        type="text"
                        name="otp"
                        className="sfa-field"
                        placeholder="Enter 4-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        maxLength={4}
                        autoComplete="one-time-code"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="sfa-label" htmlFor="newPassword">New Password</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        className="sfa-field"
                        placeholder="Min. 6 characters"
                        value={formData.newPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="sfa-input-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="sfa-label" htmlFor="confirmPassword">Confirm Password</label>
                    <div className="sfa-input-group">
                      <span className="sfa-input-icon">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="sfa-field"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    {formData.confirmPassword && (
                      <small className={formData.newPassword === formData.confirmPassword ? "text-success" : "text-danger"}>
                        <i className={`fas me-1 ${formData.newPassword === formData.confirmPassword ? "fa-check-circle" : "fa-times-circle"}`}></i>
                        {formData.newPassword === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                      </small>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn sfa-btn-outline"
                      style={{ width: "40%" }}
                      onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                      disabled={loading}
                    >
                      <i className="fas fa-arrow-left me-1"></i> Back
                    </button>
                    <button
                      type="submit"
                      className="btn sfa-btn-primary flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="sfa-divider my-4">
                <span>Remember your password?</span>
              </div>

              <Link to="/login" className="btn sfa-btn-outline w-100">
                Sign in instead
              </Link>
            </div>

            <p className="text-center mt-4 sfa-footer-note">
              <i className="fas fa-shield-alt me-1"></i> Secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

