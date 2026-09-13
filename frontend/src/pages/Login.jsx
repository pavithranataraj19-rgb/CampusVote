import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const user = response.data;

      // =====================================================
      // STORE LOGGED-IN USER
      // =====================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // =====================================================
      // STORE USER ROLE
      // =====================================================

      localStorage.setItem(
        "role",
        user.role
      );

      // =====================================================
      // STORE USER ID
      // =====================================================

      if (user.id) {
        localStorage.setItem(
          "userId",
          user.id.toString()
        );
      }

      // =====================================================
      // REDIRECT BASED ON ROLE
      // =====================================================

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {

        setError(
          "Invalid email or password."
        );

      } else if (err.response?.data?.message) {

        setError(
          err.response.data.message
        );

      } else if (
        typeof err.response?.data === "string"
      ) {

        setError(
          err.response.data
        );

      } else {

        setError(
          "Unable to connect to server. Please make sure backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* =================================================
            LEFT BRANDING SECTION
        ================================================= */}

        <div className="auth-brand">

          <div className="brand-logo">

            <div className="brand-icon">
              <i className="bi bi-bar-chart-fill"></i>
            </div>

            <div>
              <h2>CampusVote</h2>

              <span>
                Online Poll & Voting System
              </span>
            </div>

          </div>

          <div className="brand-content">

            <span className="brand-badge">
              <i className="bi bi-stars"></i>
              Campus Community
            </span>

            <h1>
              Your campus.
              <br />
              <strong>Your voice.</strong>
            </h1>

            <p>
              Participate in campus polls, share
              your opinion, and make your voice count.
            </p>

          </div>

          <div className="brand-features">

            {/* Feature 1 */}

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-check2-circle"></i>
              </div>

              <div>

                <strong>
                  Simple Voting
                </strong>

                <span>
                  Vote in active campus polls easily.
                </span>

              </div>

            </div>

            {/* Feature 2 */}

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>

              <div>

                <strong>
                  Live Results
                </strong>

                <span>
                  View poll results and voting statistics.
                </span>

              </div>

            </div>

            {/* Feature 3 */}

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-shield-check"></i>
              </div>

              <div>

                <strong>
                  Secure Access
                </strong>

                <span>
                  Your account and voting activity stay protected.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT LOGIN SECTION
        ================================================= */}

        <div className="auth-form-section">

          <div className="auth-form-wrapper">

            {/* Mobile Brand */}

            <div className="mobile-brand">

              <div className="brand-icon">
                <i className="bi bi-bar-chart-fill"></i>
              </div>

              <div>

                <h2>
                  CampusVote
                </h2>

                <span>
                  Online Poll & Voting System
                </span>

              </div>

            </div>

            {/* Heading */}

            <div className="auth-heading">

              <span className="auth-small-title">
                WELCOME BACK
              </span>

              <h1>
                Sign in to your account
              </h1>

              <p>
                Enter your credentials to continue
                to CampusVote.
              </p>

            </div>

            {/* Error */}

            {error && (

              <div className="auth-alert">

                <i className="bi bi-exclamation-circle-fill"></i>

                <span>
                  {error}
                </span>

              </div>

            )}

            {/* Login Form */}

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-envelope"></i>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="form-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <span className="forgot-password">
                    Forgot password?
                  </span>

                </div>

                <div className="input-wrapper">

                  <i className="bi bi-lock"></i>

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                </div>

              </div>

              {/* Remember Me */}

              <div className="remember-row">

                <label className="remember-label">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="spinner-border spinner-border-sm"></span>

                    Signing in...
                  </>

                ) : (

                  <>
                    Sign in

                    <i className="bi bi-arrow-right"></i>
                  </>

                )}

              </button>

            </form>

            {/* Register */}

            <div className="auth-footer">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create an account
              </Link>

            </div>

            {/* Security */}

            <div className="auth-security">

              <i className="bi bi-shield-lock"></i>

              <span>
                Secure campus voting platform
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;