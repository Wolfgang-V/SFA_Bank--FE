import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(formData);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
                  <i className="bi bi-bank2"></i>
                </div>
                <h1 className="sfa-auth-title">Welcome back</h1>
                <p className="sfa-auth-subtitle">Sign in to your SFA Bank account</p>
              </div>

              
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                  <small>{error}</small>
                </div>
              )}

              
              <form onSubmit={handleSubmit} noValidate>
               
                <div className="mb-3">
                  <label className="sfa-label" htmlFor="email">Email address</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon">
                      <i className="bi bi-envelope"></i>
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

                
                <div className="mb-1">
                  <label className="sfa-label" htmlFor="password">Password</label>
                  <div className="sfa-input-group">
                    <span className="sfa-input-icon">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="sfa-field"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="sfa-input-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                
                <div className="text-end mb-4">
                  <Link to="/forgot-password" className="sfa-link-sm">
                    Forgot password?
                  </Link>
                </div>

                
                <button
                  type="submit"
                  className="btn sfa-btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              
              <div className="sfa-divider my-4">
                <span>Don't have an account?</span>
              </div>

              
              <Link to="/register" className="btn sfa-btn-outline w-100">
                Create an account
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

export default Login;
