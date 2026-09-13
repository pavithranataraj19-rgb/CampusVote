import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/results.css";

function Results() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get logged-in user safely
  const getCurrentUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (err) {
      console.error("User data error:", err);
      return null;
    }
  };

  const user = getCurrentUser();

  // ==============================
  // LOAD RESULTS
  // ==============================
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Admin should not access student results
    if (String(user.role || "").toUpperCase() === "ADMIN") {
      navigate("/admin", { replace: true });
      return;
    }

    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------
      // 1. Get poll details
      // ------------------------------
      const pollResponse = await API.get(`/polls/${id}`);

      // ------------------------------
      // 2. Get overall poll results
      // ------------------------------
      const resultsResponse = await API.get(
        `/votes/results/${id}`
      );

      // ------------------------------
      // 3. Get current user's vote
      // ------------------------------
      let userVoteValue = null;

      if (user?.id) {
        try {
          const userVoteResponse = await API.get(
            `/votes/user/${user.id}/poll/${id}`
          );

          userVoteValue = userVoteResponse.data;
        } catch (voteError) {
          // User vote may not exist yet.
          // Don't make the whole results page fail.
          console.log("No user vote found:", voteError);
          userVoteValue = null;
        }
      }

      setPoll(pollResponse.data);
      setResults(resultsResponse.data || []);
      setUserVote(userVoteValue);
    } catch (err) {
      console.error("Results loading error:", err);

      if (err.response?.status === 404) {
        setError("Poll or voting results were not found.");
      } else if (err.response?.status === 401) {
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Unable to load voting results."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // TOTAL VOTES
  // ==============================
  const totalVotes = results.reduce(
    (total, item) =>
      total + Number(item.voteCount || 0),
    0
  );

  // ==============================
  // PERCENTAGE
  // ==============================
  const getPercentage = (item) => {
    if (
      item.percentage !== undefined &&
      item.percentage !== null
    ) {
      return Number(item.percentage);
    }

    if (totalVotes === 0) {
      return 0;
    }

    return (
      (Number(item.voteCount || 0) /
        totalVotes) *
      100
    );
  };

  const formatPercentage = (value) => {
    return Number(value || 0).toFixed(1);
  };

  // ==============================
  // FIND WINNER / LEADING OPTION
  // ==============================
  const getWinner = () => {
    if (!results.length || totalVotes === 0) {
      return null;
    }

    return results.reduce((winner, current) => {
      return Number(current.voteCount || 0) >
        Number(winner.voteCount || 0)
        ? current
        : winner;
    }, results[0]);
  };

  const winner = getWinner();

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login", { replace: true });
  };

  // Prevent rendering before redirect
  if (!user) {
    return null;
  }

  return (
    <div className="results-page">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="results-sidebar">

        {/* BRAND */}

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

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <Link to="/dashboard">
            <i className="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/polls">
            <i className="bi bi-bar-chart"></i>
            <span>Polls</span>
          </Link>

          <Link
            to={`/results/${id}`}
            className="active"
          >
            <i className="bi bi-pie-chart"></i>
            <span>Results</span>
          </Link>

          <Link to="/history">
            <i className="bi bi-clock-history"></i>
            <span>My Votes</span>
          </Link>

          <Link to="/profile">
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </Link>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-help">

            <div className="help-icon">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <strong>Secure results</strong>
              <span>Transparent voting</span>
            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
            type="button"
          >
            <i className="bi bi-box-arrow-left"></i>
            Sign out
          </button>

        </div>

      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="results-main">

        {/* TOPBAR */}

        <header className="results-topbar">

          <div>

            <span className="page-label">
              CAMPUSVOTE / RESULTS
            </span>

            <h1>Voting Results</h1>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
              type="button"
              aria-label="Notifications"
            >
              <i className="bi bi-bell"></i>
            </button>

            <div className="topbar-user">

              <div className="topbar-avatar">
                {user.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div>
                <strong>{user.name || "Student"}</strong>
                <small>Student</small>
              </div>

            </div>

          </div>

        </header>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading && (

          <div className="results-loading">

            <div
              className="spinner-border"
              role="status"
              aria-label="Loading"
            ></div>

            <p>Loading results...</p>

          </div>

        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {!loading && error && (

          <div className="results-error">

            <div className="error-icon">
              <i className="bi bi-exclamation-circle"></i>
            </div>

            <h2>Unable to load results</h2>

            <p>{error}</p>

            <button
              className="retry-btn"
              onClick={loadResults}
              type="button"
            >
              <i className="bi bi-arrow-clockwise"></i>
              Try again
            </button>

          </div>

        )}

        {/* ======================================
            RESULTS CONTENT
        ====================================== */}

        {!loading && !error && (

          <section className="results-content">

            {/* POLL HEADER */}

            <div className="results-poll-header">

              <div className="results-breadcrumb">

                <Link to="/polls">
                  Polls
                </Link>

                <i className="bi bi-chevron-right"></i>

                <span>Results</span>

              </div>

              <div className="results-header-row">

                <div>

                  <span className="results-label">
                    POLL RESULTS
                  </span>

                  <h2>
                    {poll?.question || "Poll Results"}
                  </h2>

                  <p>
                    {poll?.description ||
                      "Current voting results for this campus poll."}
                  </p>

                </div>

                <div className="total-votes-box">

                  <div className="total-votes-icon">
                    <i className="bi bi-people"></i>
                  </div>

                  <div>
                    <strong>{totalVotes}</strong>
                    <span>Total votes</span>
                  </div>

                </div>

              </div>

            </div>

            {/* SUMMARY CARDS */}

            <div className="results-summary">

              {/* TOTAL VOTES */}

              <div className="summary-card">

                <div className="summary-icon">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <span>Total votes</span>
                  <strong>{totalVotes}</strong>
                </div>

              </div>

              {/* OPTIONS */}

              <div className="summary-card">

                <div className="summary-icon">
                  <i className="bi bi-list-check"></i>
                </div>

                <div>
                  <span>Options</span>
                  <strong>{results.length}</strong>
                </div>

              </div>

              {/* WINNER */}

              <div className="summary-card">

                <div className="summary-icon winner-icon">
                  <i className="bi bi-trophy"></i>
                </div>

                <div>
                  <span>Leading option</span>

                  <strong>
                    {winner?.optionText || "—"}
                  </strong>

                </div>

              </div>

            </div>

            {/* RESULTS SECTION */}

            <div className="results-section">

              <div className="results-section-heading">

                <div>

                  <span className="section-label">
                    VOTE BREAKDOWN
                  </span>

                  <h3>
                    How students voted
                  </h3>

                </div>

                <button
                  className="refresh-btn"
                  onClick={loadResults}
                  type="button"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Refresh
                </button>

              </div>

              {/* NO RESULTS */}

              {results.length === 0 ? (

                <div className="no-results">

                  <div className="no-results-icon">
                    <i className="bi bi-bar-chart"></i>
                  </div>

                  <h3>No votes yet</h3>

                  <p>
                    Results will appear here once
                    students start voting.
                  </p>

                </div>

              ) : (

                <div className="results-list">

                  {results.map((item, index) => {

                    const percentage =
                      getPercentage(item);

                    const isWinner =
                      winner &&
                      Number(winner.optionId) ===
                        Number(item.optionId);

                    const isUserVote =
                      userVote !== null &&
                      userVote !== undefined &&
                      Number(userVote) ===
                        Number(item.optionId);

                    return (

                      <div
                        className={`result-card ${
                          isWinner ? "winner" : ""
                        } ${
                          isUserVote
                            ? "user-selected"
                            : ""
                        }`}
                        key={item.optionId}
                      >

                        {/* RESULT TOP */}

                        <div className="result-top">

                          <div className="result-option">

                            <div className="result-letter">
                              {String.fromCharCode(
                                65 + index
                              )}
                            </div>

                            <div className="result-option-info">

                              <div className="result-option-title">

                                <strong>
                                  {item.optionText}
                                </strong>

                                {/* LEADING */}

                                {isWinner && (

                                  <span className="winner-badge">

                                    <i className="bi bi-trophy-fill"></i>

                                    Leading

                                  </span>

                                )}

                                {/* USER VOTE */}

                                {isUserVote && (

                                  <span className="your-vote-badge">

                                    <i className="bi bi-check-circle-fill"></i>

                                    Your Vote

                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                          <div className="result-number">

                            <strong>
                              {Number(
                                item.voteCount || 0
                              )}
                            </strong>

                            <span>
                              votes
                            </span>

                          </div>

                        </div>

                        {/* PROGRESS BAR */}

                        <div className="result-progress-row">

                          <div className="result-progress">

                            <div
                              className="result-progress-fill"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    percentage,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>

                          </div>

                          <strong>
                            {formatPercentage(
                              percentage
                            )}
                            %
                          </strong>

                        </div>

                        {/* USER MESSAGE */}

                        {isUserVote && (

                          <div className="user-vote-message">

                            <i className="bi bi-check-circle-fill"></i>

                            <span>
                              You voted for this option
                            </span>

                          </div>

                        )}

                      </div>

                    );
                  })}

                </div>

              )}

            </div>

            {/* FOOTER ACTIONS */}

            <div className="results-actions">

              <Link
                to="/polls"
                className="back-polls-btn"
              >
                <i className="bi bi-arrow-left"></i>
                Back to Polls
              </Link>

              {poll && (

                <Link
                  to={`/vote/${poll.id}`}
                  className="vote-again-btn"
                >
                  View Poll
                  <i className="bi bi-arrow-right"></i>
                </Link>

              )}

            </div>

          </section>

        )}

      </main>

      {/* ======================================
          MOBILE NAVIGATION
      ====================================== */}

      <nav className="mobile-bottom-nav">

        <Link to="/dashboard">
          <i className="bi bi-grid-1x2"></i>
          <span>Home</span>
        </Link>

        <Link to="/polls">
          <i className="bi bi-bar-chart"></i>
          <span>Polls</span>
        </Link>

        <Link
          to={`/results/${id}`}
          className="active"
        >
          <i className="bi bi-pie-chart"></i>
          <span>Results</span>
        </Link>

        <Link to="/history">
          <i className="bi bi-clock-history"></i>
          <span>Votes</span>
        </Link>

        <Link to="/profile">
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </Link>

      </nav>

    </div>
  );
}

export default Results;