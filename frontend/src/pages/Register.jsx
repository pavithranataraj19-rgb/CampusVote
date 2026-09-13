import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", response.data);

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.status === 400) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data?.message ||
              "Unable to create account."
        );
      } else {
        setError(
          "Unable to connect to server. Please make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* ================= LEFT BRANDING ================= */}

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
              Join your campus.
              <br />
              <strong>Make your voice count.</strong>
            </h1>

            <p>
              Create your student account and participate
              in campus polls and voting.
            </p>

          </div>

          <div className="brand-features">

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-person-check"></i>
              </div>

              <div>
                <strong>Easy Registration</strong>

                <span>
                  Create your campus account in seconds.
                </span>
              </div>

            </div>

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>

              <div>
                <strong>Participate in Polls</strong>

                <span>
                  Share your opinion through campus polls.
                </span>
              </div>

            </div>

            <div className="brand-feature">

              <div className="feature-icon">
                <i className="bi bi-shield-check"></i>
              </div>

              <div>
                <strong>Secure Voting</strong>

                <span>
                  Your voting activity is protected.
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* ================= REGISTER FORM ================= */}

        <div className="auth-form-section">

          <div className="auth-form-wrapper">

            {/* Mobile Brand */}

            <div className="mobile-brand">

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


            {/* Heading */}

            <div className="auth-heading">

              <span className="auth-small-title">
                GET STARTED
              </span>

              <h1>
                Create your account
              </h1>

              <p>
                Register as a student to participate in
                CampusVote.
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


            {/* Success */}

            {success && (

              <div
                className="auth-alert"
                style={{
                  borderColor: "#b7dfc5",
                  backgroundColor: "#f0fff4",
                  color: "#237a3b",
                }}
              >

                <i className="bi bi-check-circle-fill"></i>

                <span>
                  {success}
                </span>

              </div>

            )}


            {/* Form */}

            <form onSubmit={handleSubmit}>

              {/* Name */}

              <div className="form-group">

                <label htmlFor="name">
                  Full name
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-person"></i>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />

                </div>

              </div>


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

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-lock"></i>

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                </div>

              </div>


              {/* Confirm Password */}

              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-shield-lock"></i>

                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                </div>

              </div>


              {/* Register Button */}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="spinner-border spinner-border-sm"></span>

                    Creating account...
                  </>

                ) : (

                  <>
                    Create account

                    <i className="bi bi-arrow-right"></i>
                  </>

                )}

              </button>

            </form>


            {/* Login Link */}

            <div className="auth-footer">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
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

export default Register;