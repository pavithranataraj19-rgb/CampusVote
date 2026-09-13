import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!storedUser) {
      navigate("/login");
      return;
    }

    if (storedUser.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const getInitial = () => {
    return user.name?.charAt(0).toUpperCase() || "P";
  };

  return (
    <div className="profile-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="profile-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <i className="bi bi-check2-square"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Student Portal</span>
          </div>

        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">

          <Link to="/dashboard">
            <i className="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/polls">
            <i className="bi bi-bar-chart"></i>
            <span>Polls</span>
          </Link>

          <Link to="/polls">
            <i className="bi bi-pie-chart"></i>
            <span>Results</span>
          </Link>

          <Link to="/history">
            <i className="bi bi-clock-history"></i>
            <span>My Votes</span>
          </Link>

          <Link
            to="/profile"
            className="active"
          >
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help">

            <div className="help-icon">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <strong>Secure account</strong>
              <span>Your profile is protected</span>
            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left"></i>
            Sign out
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="profile-main">

        {/* TOPBAR */}

        <header className="profile-topbar">

          <div>
            <span className="page-label">
              CAMPUSVOTE / PROFILE
            </span>

            <h1>My Profile</h1>
          </div>

          <div className="topbar-right">

            <button className="notification-btn">
              <i className="bi bi-bell"></i>
            </button>

            <div className="topbar-user">

              <div className="topbar-avatar">
                {getInitial()}
              </div>

              <div>
                <strong>{user.name}</strong>
                <small>Student</small>
              </div>

            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}

        <section className="profile-content">

          {/* PROFILE HERO */}

          <div className="profile-hero">

            <div className="profile-hero-left">

              <div className="large-profile-avatar">
                {getInitial()}
              </div>

              <div className="profile-hero-info">

                <span className="profile-role">
                  STUDENT ACCOUNT
                </span>

                <h2>{user.name}</h2>

                <p>{user.email}</p>

              </div>

            </div>

            <div className="account-status">

              <span className="status-dot"></span>

              <span>Active Account</span>

            </div>

          </div>


          {/* PROFILE GRID */}

          <div className="profile-grid">

            {/* PERSONAL INFORMATION */}

            <div className="profile-card">

              <div className="profile-card-header">

                <div className="profile-card-icon">
                  <i className="bi bi-person-vcard"></i>
                </div>

                <div>
                  <span className="card-label">
                    ACCOUNT DETAILS
                  </span>

                  <h3>Personal Information</h3>
                </div>

              </div>


              <div className="profile-fields">

                <div className="profile-field">

                  <label>
                    Full Name
                  </label>

                  <div className="field-value">
                    <i className="bi bi-person"></i>
                    <span>{user.name}</span>
                  </div>

                </div>


                <div className="profile-field">

                  <label>
                    Email Address
                  </label>

                  <div className="field-value">
                    <i className="bi bi-envelope"></i>
                    <span>{user.email}</span>
                  </div>

                </div>


                <div className="profile-field">

                  <label>
                    Account Role
                  </label>

                  <div className="field-value">

                    <i className="bi bi-person-badge"></i>

                    <span>
                      {user.role || "STUDENT"}
                    </span>

                  </div>

                </div>


                <div className="profile-field">

                  <label>
                    Account Status
                  </label>

                  <div className="field-value">

                    <i className="bi bi-check-circle"></i>

                    <span className="active-text">
                      Active
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* ACCOUNT SECURITY */}

            <div className="profile-card">

              <div className="profile-card-header">

                <div className="profile-card-icon">
                  <i className="bi bi-shield-lock"></i>
                </div>

                <div>
                  <span className="card-label">
                    SECURITY
                  </span>

                  <h3>Account Security</h3>
                </div>

              </div>


              <div className="security-list">

                <div className="security-item">

                  <div className="security-item-icon">
                    <i className="bi bi-lock"></i>
                  </div>

                  <div className="security-item-text">

                    <strong>
                      Password
                    </strong>

                    <span>
                      Your password is securely stored.
                    </span>

                  </div>

                  <span className="security-badge">
                    Protected
                  </span>

                </div>


                <div className="security-item">

                  <div className="security-item-icon">
                    <i className="bi bi-person-check"></i>
                  </div>

                  <div className="security-item-text">

                    <strong>
                      Account Verification
                    </strong>

                    <span>
                      Your account is active.
                    </span>

                  </div>

                  <span className="security-badge">
                    Active
                  </span>

                </div>


                <div className="security-item">

                  <div className="security-item-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div className="security-item-text">

                    <strong>
                      Voting Privacy
                    </strong>

                    <span>
                      Your vote is recorded securely.
                    </span>

                  </div>

                  <span className="security-badge">
                    Secure
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* VOTING INFORMATION */}

          <div className="profile-card voting-info-card">

            <div className="profile-card-header">

              <div className="profile-card-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>

              <div>

                <span className="card-label">
                  CAMPUSVOTE
                </span>

                <h3>About Your Voting Account</h3>

              </div>

            </div>


            <div className="voting-info-grid">

              <div className="info-box">

                <div className="info-box-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>

                <div>
                  <strong>Participate</strong>

                  <span>
                    Vote in active campus polls.
                  </span>
                </div>

              </div>


              <div className="info-box">

                <div className="info-box-icon">
                  <i className="bi bi-bar-chart"></i>
                </div>

                <div>
                  <strong>View Results</strong>

                  <span>
                    Check voting results after participating.
                  </span>
                </div>

              </div>


              <div className="info-box">

                <div className="info-box-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <strong>My Votes</strong>

                  <span>
                    Review your previous voting activity.
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="profile-actions">

            <Link
              to="/dashboard"
              className="profile-back-btn"
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </Link>

            <button
              className="profile-signout-btn"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              Sign Out
            </button>

          </div>

        </section>

      </main>


      {/* ================= MOBILE NAV ================= */}

      <nav className="mobile-bottom-nav">

        <Link to="/dashboard">
          <i className="bi bi-grid-1x2"></i>
          <span>Home</span>
        </Link>

        <Link to="/polls">
          <i className="bi bi-bar-chart"></i>
          <span>Polls</span>
        </Link>

        <Link to="/polls">
          <i className="bi bi-pie-chart"></i>
          <span>Results</span>
        </Link>

        <Link to="/history">
          <i className="bi bi-clock-history"></i>
          <span>Votes</span>
        </Link>

        <Link
          to="/profile"
          className="active"
        >
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </Link>

      </nav>

    </div>
  );
}

export default Profile;