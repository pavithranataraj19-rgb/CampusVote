import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      // Admin should use admin dashboard
      if (parsedUser.role === "ADMIN") {
        navigate("/admin");
        return;
      }

      loadPolls();
    } catch (err) {
      console.error("User data error:", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/polls");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setPolls(data);
    } catch (err) {
      console.error("Poll loading error:", err);

      setError(
        "Unable to load polls. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPollStatus = (poll) => {
    const now = new Date();

    const start = poll.startDate
      ? new Date(poll.startDate)
      : null;

    const end = poll.endDate
      ? new Date(poll.endDate)
      : null;

    if (!poll.active) {
      return "CLOSED";
    }

    if (start && now < start) {
      return "UPCOMING";
    }

    if (end && now > end) {
      return "CLOSED";
    }

    return "LIVE";
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const livePolls = useMemo(() => {
    return polls.filter(
      (poll) => getPollStatus(poll) === "LIVE"
    );
  }, [polls]);

  const recentPolls = useMemo(() => {
    return [...polls]
      .sort((a, b) => {
        const dateA = new Date(a.startDate || 0);
        const dateB = new Date(b.startDate || 0);

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [polls]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "Student";

  return (
    <div className="app-shell">

      {/* =====================================
          DESKTOP SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <i className="bi bi-bar-chart-fill"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Student Portal</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <p className="nav-section-title">
            MAIN MENU
          </p>

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/polls"
            className="nav-item"
          >
            <i className="bi bi-ui-checks-grid"></i>
            <span>Polls</span>
          </Link>

          <Link
            to={
              livePolls.length > 0
                ? `/results/${livePolls[0].id}`
                : "/polls"
            }
            className="nav-item"
          >
            <i className="bi bi-bar-chart"></i>
            <span>Results</span>
          </Link>

          <Link
            to="/history"
            className="nav-item"
          >
            <i className="bi bi-clock-history"></i>
            <span>History</span>
          </Link>

          <p className="nav-section-title second-section">
            ACCOUNT
          </p>

          <Link
            to="/profile"
            className="nav-item"
          >
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign out</span>
          </button>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        {/* Topbar */}

        <header className="topbar">

          <div className="topbar-left">

            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <i className="bi bi-bar-chart-fill"></i>
              </div>

              <strong>CampusVote</strong>
            </div>

            <div className="page-location">
              <span>Student Portal</span>
              <i className="bi bi-chevron-right"></i>
              <strong>Dashboard</strong>
            </div>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
              title="Notifications"
            >
              <i className="bi bi-bell"></i>
              <span className="notification-dot"></span>
            </button>

            <Link
              to="/profile"
              className="user-mini"
            >
              <div className="user-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="user-mini-info">
                <strong>{firstName}</strong>
                <span>Student</span>
              </div>

              <i className="bi bi-chevron-down"></i>
            </Link>

          </div>

        </header>

        <div className="dashboard-content">

          {/* =====================================
              WELCOME HERO
          ====================================== */}

          <section className="welcome-section">

            <div className="welcome-text">

              <span className="welcome-label">
                <i className="bi bi-stars"></i>
                STUDENT DASHBOARD
              </span>

              <h1>
                Good day, {firstName}.
                <br />
                <strong>Your voice matters.</strong>
              </h1>

              <p>
                Stay updated with campus polls, cast your vote,
                and see what your college community thinks.
              </p>

              <Link
                to="/polls"
                className="primary-action"
              >
                Explore polls
                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

            <div className="welcome-illustration">

              <div className="illustration-circle large"></div>
              <div className="illustration-circle small"></div>

              <div className="illustration-card">

                <i className="bi bi-check2-circle"></i>

                <div>
                  <strong>Your voice</strong>
                  <span>counts here</span>
                </div>

              </div>

              <i className="bi bi-bar-chart-fill floating-chart"></i>

            </div>

          </section>

          {/* =====================================
              STATISTICS
          ====================================== */}

          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon yellow">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>

              <div>
                <span>Active Polls</span>
                <strong>{livePolls.length}</strong>
              </div>

              <div className="stat-arrow">
                <i className="bi bi-arrow-up-right"></i>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon navy">
                <i className="bi bi-ui-checks-grid"></i>
              </div>

              <div>
                <span>Total Polls</span>
                <strong>{polls.length}</strong>
              </div>

              <div className="stat-arrow">
                <i className="bi bi-arrow-up-right"></i>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                <i className="bi bi-check-circle-fill"></i>
              </div>

              <div>
                <span>Your Activity</span>
                <strong>Ready</strong>
              </div>

              <div className="stat-arrow">
                <i className="bi bi-arrow-up-right"></i>
              </div>

            </div>

          </section>

          {/* =====================================
              ERROR
          ====================================== */}

          {error && (
            <div className="dashboard-alert">
              <i className="bi bi-exclamation-circle-fill"></i>

              <div>
                <strong>Unable to load polls</strong>
                <span>{error}</span>
              </div>

              <button onClick={loadPolls}>
                Retry
              </button>
            </div>
          )}

          {/* =====================================
              ACTIVE POLLS
          ====================================== */}

          <section className="poll-section">

            <div className="section-header">

              <div>
                <span className="section-kicker">
                  PARTICIPATE
                </span>

                <h2>Active polls</h2>

                <p>
                  Make your choice before the voting period ends.
                </p>
              </div>

              <Link
                to="/polls"
                className="view-all-link"
              >
                View all
                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

            {loading ? (

              <div className="loading-card">

                <div className="spinner-border"></div>

                <span>
                  Loading campus polls...
                </span>

              </div>

            ) : livePolls.length === 0 ? (

              <div className="empty-card">

                <div className="empty-icon">
                  <i className="bi bi-inbox"></i>
                </div>

                <h3>No active polls</h3>

                <p>
                  There are currently no active polls.
                  Check back later for new campus polls.
                </p>

                <Link
                  to="/polls"
                  className="secondary-action"
                >
                  Browse all polls
                </Link>

              </div>

            ) : (

              <div className="poll-grid">

                {livePolls.slice(0, 4).map((poll) => (

                  <article
                    className="dashboard-poll-card"
                    key={poll.id}
                  >

                    <div className="poll-card-top">

                      <span className="live-badge">
                        <span></span>
                        LIVE
                      </span>

                      <span className="poll-number">
                        POLL #{poll.id}
                      </span>

                    </div>

                    <div className="poll-card-body">

                      <h3>
                        {poll.question}
                      </h3>

                      <p>
                        {poll.description ||
                          "Share your opinion by voting in this campus poll."}
                      </p>

                    </div>

                    <div className="poll-card-meta">

                      <div>
                        <i className="bi bi-calendar3"></i>

                        <span>
                          Ends {formatDate(poll.endDate)}
                        </span>
                      </div>

                      <div>
                        <i className="bi bi-list-check"></i>

                        <span>
                          {poll.options?.length || "Multiple"} options
                        </span>
                      </div>

                    </div>

                    <div className="poll-card-actions">

                      <Link
                        to={`/vote/${poll.id}`}
                        className="vote-action"
                      >
                        Vote now
                        <i className="bi bi-arrow-right"></i>
                      </Link>

                      <Link
                        to={`/results/${poll.id}`}
                        className="result-action"
                        title="View results"
                      >
                        <i className="bi bi-bar-chart"></i>
                      </Link>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

          {/* =====================================
              RECENT POLLS
          ====================================== */}

          <section className="recent-section">

            <div className="section-header">

              <div>
                <span className="section-kicker">
                  OVERVIEW
                </span>

                <h2>Recent polls</h2>

                <p>
                  Latest polls created for your campus.
                </p>
              </div>

            </div>

            {recentPolls.length === 0 ? (

              <div className="empty-card compact">

                <i className="bi bi-clipboard-x"></i>

                <span>
                  No polls have been created yet.
                </span>

              </div>

            ) : (

              <div className="recent-list">

                {recentPolls.map((poll) => {

                  const status = getPollStatus(poll);

                  return (
                    <div
                      className="recent-item"
                      key={poll.id}
                    >

                      <div className="recent-poll-icon">
                        <i className="bi bi-bar-chart"></i>
                      </div>

                      <div className="recent-poll-info">

                        <h3>
                          {poll.question}
                        </h3>

                        <span>
                          Created poll #{poll.id}
                          {" • "}
                          {formatDate(poll.startDate)}
                        </span>

                      </div>

                      <span
                        className={`status-pill ${status.toLowerCase()}`}
                      >
                        {status}
                      </span>

                      <Link
                        to={`/results/${poll.id}`}
                        className="recent-arrow"
                        title="View results"
                      >
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>

                    </div>
                  );
                })}

              </div>

            )}

          </section>

          {/* =====================================
              QUICK ACCESS
          ====================================== */}

          <section className="quick-section">

            <div className="section-header">

              <div>
                <span className="section-kicker">
                  QUICK ACCESS
                </span>

                <h2>What would you like to do?</h2>
              </div>

            </div>

            <div className="quick-grid">

              <Link
                to="/polls"
                className="quick-card"
              >
                <div className="quick-icon yellow">
                  <i className="bi bi-ui-checks"></i>
                </div>

                <div>
                  <strong>Browse polls</strong>
                  <span>
                    Explore available campus polls
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>

              <Link
                to={
                  livePolls.length > 0
                    ? `/results/${livePolls[0].id}`
                    : "/polls"
                }
                className="quick-card"
              >
                <div className="quick-icon navy">
                  <i className="bi bi-bar-chart-line"></i>
                </div>

                <div>
                  <strong>View results</strong>
                  <span>
                    See poll voting statistics
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>

              <Link
                to="/history"
                className="quick-card"
              >
                <div className="quick-icon green">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <strong>Voting history</strong>
                  <span>
                    Review your previous activity
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

          </section>

        </div>

      </main>

      {/* =====================================
          MOBILE BOTTOM NAVIGATION
      ====================================== */}

      <nav className="mobile-bottom-nav">

        <Link
          to="/dashboard"
          className="mobile-nav-item active"
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Home</span>
        </Link>

        <Link
          to="/polls"
          className="mobile-nav-item"
        >
          <i className="bi bi-ui-checks-grid"></i>
          <span>Polls</span>
        </Link>

        <Link
          to={
            livePolls.length > 0
              ? `/results/${livePolls[0].id}`
              : "/polls"
          }
          className="mobile-nav-item"
        >
          <i className="bi bi-bar-chart"></i>
          <span>Results</span>
        </Link>

        <Link
          to="/history"
          className="mobile-nav-item"
        >
          <i className="bi bi-clock-history"></i>
          <span>History</span>
        </Link>

        <Link
          to="/profile"
          className="mobile-nav-item"
        >
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </Link>

      </nav>

    </div>
  );
}

export default Dashboard;