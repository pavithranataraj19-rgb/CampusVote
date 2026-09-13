import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/polls.css";

function Polls() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/polls");
      setPolls(response.data || []);
    } catch (err) {
      console.error("Poll loading error:", err);
      setError("Unable to load polls. Please try again.");
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

  const getOptionCount = (poll) => {
    return poll.options?.length || 0;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="polls-page">

      {/* Sidebar */}
      <aside className="polls-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <i className="bi bi-bar-chart-fill"></i>
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

          <Link to="/polls" className="active">
            <i className="bi bi-ui-checks-grid"></i>
            <span>Polls</span>
          </Link>

          <Link
            to={
              polls.length > 0
                ? `/results/${polls[0].id}`
                : "/polls"
            }
          >
            <i className="bi bi-bar-chart"></i>
            <span>Results</span>
          </Link>

          <Link to="/history">
            <i className="bi bi-clock-history"></i>
            <span>History</span>
          </Link>

          <Link to="/profile">
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help">
            <div className="help-icon">
              <i className="bi bi-question-circle"></i>
            </div>

            <div>
              <strong>Need help?</strong>
              <span>Contact your admin</span>
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

      {/* Main Content */}
      <main className="polls-main">

        {/* Topbar */}
        <header className="polls-topbar">

          <div>
            <span className="page-label">
              CAMPUSVOTE
            </span>

            <h1>Polls</h1>
          </div>

          <div className="topbar-right">

            <button className="notification-btn">
              <i className="bi bi-bell"></i>
              <span></span>
            </button>

            <div className="topbar-user">

              <div className="topbar-avatar">
                {user.name?.charAt(0).toUpperCase() || "S"}
              </div>

              <div>
                <strong>{user.name}</strong>
                <small>Student</small>
              </div>

            </div>

          </div>

        </header>

        {/* Page Introduction */}
        <section className="polls-intro">

          <div>
            <span className="intro-badge">
              <i className="bi bi-check2-circle"></i>
              PARTICIPATE
            </span>

            <h2>Make your voice count.</h2>

            <p>
              Browse campus polls and share your opinion.
              Your vote helps shape your college community.
            </p>
          </div>

          <div className="intro-icon">
            <i className="bi bi-ui-checks-grid"></i>
          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="polls-alert">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>

            <button onClick={loadPolls}>
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (

          <div className="polls-loading">

            <div className="spinner-border"></div>

            <p>Loading polls...</p>

          </div>

        ) : (

          <>
            {/* Poll Header */}
            <div className="polls-section-header">

              <div>
                <span className="section-label">
                  AVAILABLE POLLS
                </span>

                <h3>
                  Campus polls
                  <span>{polls.length}</span>
                </h3>
              </div>

              <button
                className="refresh-btn"
                onClick={loadPolls}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>

            </div>

            {/* Poll Grid */}
            {polls.length === 0 ? (

              <div className="polls-empty">

                <div className="empty-icon">
                  <i className="bi bi-inbox"></i>
                </div>

                <h3>No polls available</h3>

                <p>
                  There are no campus polls available right now.
                  Check again later.
                </p>

                <button
                  onClick={loadPolls}
                  className="empty-btn"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Check again
                </button>

              </div>

            ) : (

              <div className="poll-grid">

                {polls.map((poll) => {

                  const status = getPollStatus(poll);

                  return (
                    <article
                      className="poll-card"
                      key={poll.id}
                    >

                      {/* Card Top */}
                      <div className="poll-card-top">

                        <span
                          className={`poll-status ${status.toLowerCase()}`}
                        >
                          <span className="status-dot"></span>
                          {status}
                        </span>

                        <span className="poll-number">
                          #{String(poll.id).padStart(2, "0")}
                        </span>

                      </div>

                      {/* Card Body */}
                      <div className="poll-card-body">

                        <h3>
                          {poll.question}
                        </h3>

                        <p>
                          {poll.description ||
                            "Share your opinion by participating in this campus poll."}
                        </p>

                        <div className="poll-meta">

                          <div>
                            <i className="bi bi-calendar3"></i>

                            <span>
                              {formatDate(poll.startDate)}
                              {" — "}
                              {formatDate(poll.endDate)}
                            </span>
                          </div>

                          <div>
                            <i className="bi bi-list-check"></i>

                            <span>
                              {getOptionCount(poll)} options
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* Card Footer */}
                      <div className="poll-card-footer">

                        {status === "LIVE" ? (

                          <Link
                            to={`/vote/${poll.id}`}
                            className="poll-action primary"
                          >
                            Vote now
                            <i className="bi bi-arrow-right"></i>
                          </Link>

                        ) : status === "UPCOMING" ? (

                          <button
                            className="poll-action disabled"
                            disabled
                          >
                            Starts soon
                            <i className="bi bi-clock"></i>
                          </button>

                        ) : (

                          <Link
                            to={`/results/${poll.id}`}
                            className="poll-action secondary"
                          >
                            View results
                            <i className="bi bi-bar-chart"></i>
                          </Link>

                        )}

                        <Link
                          to={`/results/${poll.id}`}
                          className="poll-results-link"
                        >
                          Results
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}
          </>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">

        <Link to="/dashboard">
          <i className="bi bi-grid-1x2"></i>
          <span>Home</span>
        </Link>

        <Link to="/polls" className="active">
          <i className="bi bi-ui-checks-grid"></i>
          <span>Polls</span>
        </Link>

        <Link
          to={
            polls.length > 0
              ? `/results/${polls[0].id}`
              : "/polls"
          }
        >
          <i className="bi bi-bar-chart"></i>
          <span>Results</span>
        </Link>

        <Link to="/history">
          <i className="bi bi-clock-history"></i>
          <span>History</span>
        </Link>

        <Link to="/profile">
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </Link>

      </nav>

    </div>
  );
}

export default Polls;