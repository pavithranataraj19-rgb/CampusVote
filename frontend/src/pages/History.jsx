import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/history.css";

function History() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [voteHistory, setVoteHistory] = useState([]);
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

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/polls");

      const allPolls = response.data || [];

      setPolls(allPolls);

      const history = [];

      for (const poll of allPolls) {
        try {
          const voteResponse = await API.get(
            `/votes/user/${user.id}/poll/${poll.id}`
          );

          const selectedOptionId = voteResponse.data;

          // User has voted in this poll
          if (
            selectedOptionId !== null &&
            selectedOptionId !== undefined
          ) {
            const selectedOption = (poll.options || []).find(
              (option) =>
                Number(option.id) === Number(selectedOptionId)
            );

            history.push({
              pollId: poll.id,
              question: poll.question,
              description: poll.description,
              optionId: Number(selectedOptionId),
              optionText:
                selectedOption?.optionText ||
                "Selected option",
              startDate: poll.startDate,
              endDate: poll.endDate,
            });
          }
        } catch (err) {
          console.log(
            `Unable to check vote for poll ${poll.id}`
          );
        }
      }

      setVoteHistory(history);
    } catch (err) {
      console.error("History loading error:", err);

      setError("Unable to load your voting history.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPollStatus = (poll) => {
    if (!poll) {
      return "CLOSED";
    }

    if (!poll.active) {
      return "CLOSED";
    }

    const now = new Date();

    const start = poll.startDate
      ? new Date(poll.startDate)
      : null;

    const end = poll.endDate
      ? new Date(poll.endDate)
      : null;

    if (start && now < start) {
      return "UPCOMING";
    }

    if (end && now > end) {
      return "CLOSED";
    }

    return "LIVE";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="history-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="history-sidebar">

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

          {/* Results requires a poll ID.
              Users can open results from a poll/history card. */}
          <Link to="/polls">
            <i className="bi bi-pie-chart"></i>
            <span>Results</span>
          </Link>

          <Link
            to="/history"
            className="active"
          >
            <i className="bi bi-clock-history"></i>
            <span>My Votes</span>
          </Link>

          <Link to="/profile">
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
              <strong>Secure voting</strong>
              <span>Your vote is private</span>
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

      <main className="history-main">

        {/* ================= TOPBAR ================= */}

        <header className="history-topbar">

          <div>

            <span className="page-label">
              CAMPUSVOTE / MY VOTES
            </span>

            <h1>Voting history</h1>

          </div>

          <div className="topbar-right">

            <button
              className="notification-btn"
              type="button"
            >
              <i className="bi bi-bell"></i>
            </button>

            <div className="topbar-user">

              <div className="topbar-avatar">
                {user.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div>
                <strong>{user.name}</strong>
                <small>Student</small>
              </div>

            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="history-content">

          {/* ================= INTRO ================= */}

          <div className="history-intro">

            <div>

              <span className="section-label">
                YOUR ACTIVITY
              </span>

              <h2>My voting history</h2>

              <p>
                View the polls you have participated in
                and the options you selected.
              </p>

            </div>

            <div className="history-count">

              <i className="bi bi-check2-circle"></i>

              <div>

                <strong>
                  {voteHistory.length}
                </strong>

                <span>
                  {voteHistory.length === 1
                    ? "Vote cast"
                    : "Votes cast"}
                </span>

              </div>

            </div>

          </div>

          {/* ================= LOADING ================= */}

          {loading && (

            <div className="history-loading">

              <div className="spinner-border"></div>

              <p>
                Loading your voting history...
              </p>

            </div>

          )}

          {/* ================= ERROR ================= */}

          {!loading && error && (

            <div className="history-error">

              <div className="error-icon">
                <i className="bi bi-exclamation-circle"></i>
              </div>

              <h3>
                Unable to load history
              </h3>

              <p>
                {error}
              </p>

              <button
                className="retry-btn"
                onClick={loadHistory}
                type="button"
              >
                <i className="bi bi-arrow-clockwise"></i>
                Try Again
              </button>

            </div>

          )}

          {/* ================= EMPTY ================= */}

          {!loading &&
            !error &&
            voteHistory.length === 0 && (

              <div className="history-empty">

                <div className="empty-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <h3>
                  No votes yet
                </h3>

                <p>
                  You haven't participated in any
                  campus polls yet.
                </p>

                <Link
                  to="/polls"
                  className="browse-polls-btn"
                >
                  Browse Polls
                  <i className="bi bi-arrow-right"></i>
                </Link>

              </div>

            )}

          {/* ================= HISTORY LIST ================= */}

          {!loading &&
            !error &&
            voteHistory.length > 0 && (

              <div className="history-list">

                <div className="history-list-header">

                  <div>

                    <span className="section-label">
                      ACTIVITY
                    </span>

                    <h3>
                      Your submitted votes
                    </h3>

                  </div>

                  <span className="history-total">
                    {voteHistory.length}{" "}
                    {voteHistory.length === 1
                      ? "poll"
                      : "polls"}
                  </span>

                </div>

                {voteHistory.map((item, index) => {

                  const currentPoll = polls.find(
                    (poll) =>
                      Number(poll.id) ===
                      Number(item.pollId)
                  );

                  const status =
                    getPollStatus(currentPoll);

                  return (

                    <div
                      className="history-card"
                      key={item.pollId}
                    >

                      {/* NUMBER */}

                      <div className="history-card-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* CONTENT */}

                      <div className="history-card-content">

                        {/* TOP */}

                        <div className="history-card-top">

                          <span
                            className={`history-status ${status.toLowerCase()}`}
                          >
                            <span className="status-dot"></span>
                            {status}
                          </span>

                          <span className="history-date">
                            <i className="bi bi-calendar3"></i>
                            {formatDate(item.endDate)}
                          </span>

                        </div>

                        {/* QUESTION */}

                        <h3>
                          {item.question}
                        </h3>

                        {/* DESCRIPTION */}

                        {item.description && (

                          <p>
                            {item.description}
                          </p>

                        )}

                        {/* SELECTED ANSWER */}

                        <div className="selected-answer">

                          <div className="selected-answer-icon">
                            <i className="bi bi-check-lg"></i>
                          </div>

                          <div>

                            <span>
                              YOUR ANSWER
                            </span>

                            <strong>
                              {item.optionText}
                            </strong>

                          </div>

                          <span className="selected-badge">
                            Selected
                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="history-card-actions">

                          <Link
                            to={`/results/${item.pollId}`}
                            className="history-results-btn"
                          >
                            View Results
                            <i className="bi bi-arrow-right"></i>
                          </Link>

                        </div>

                      </div>

                    </div>

                  );
                })}

              </div>

            )}

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

        <Link
          to="/history"
          className="active"
        >
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

export default History;