import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/vote.css";

function Vote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

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

    loadPoll();
    checkVote();
  }, [id]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/polls/${id}`);
      setPoll(response.data);
    } catch (err) {
      console.error("Poll loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this poll."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkVote = async () => {
    try {
      if (!user?.id) return;

      const response = await API.get(
        `/votes/check/${user.id}/${id}`
      );

      setHasVoted(response.data === true);
    } catch (err) {
      /*
        If the backend does not have the check endpoint yet,
        we don't block the page.
      */
      console.log("Vote check unavailable.");
    }
  };

  const getPollStatus = () => {
    if (!poll) return "CLOSED";

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

  const handleOptionSelect = (optionId) => {
    if (hasVoted || submitting) return;

    setSelectedOption(optionId);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      setError("Please select an option before submitting.");
      return;
    }

    if (hasVoted) {
      setError("You have already voted in this poll.");
      return;
    }

    if (!user?.id) {
      setError("User session not found. Please login again.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await API.post("/votes", {
        userId: user.id,
        pollId: Number(id),
        optionId: selectedOption,
      });

      setSuccess("Your vote has been submitted successfully.");
      setHasVoted(true);

      setTimeout(() => {
        navigate(`/results/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Vote submission error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "";

      if (
        typeof message === "string" &&
        message.toLowerCase().includes("already")
      ) {
        setHasVoted(true);
        setError("You have already voted in this poll.");
      } else {
        setError(
          typeof message === "string" && message
            ? message
            : "Unable to submit your vote. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const status = getPollStatus();

  return (
    <div className="vote-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="vote-sidebar">

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

          <Link to="/polls" className="active">
            <i className="bi bi-bar-chart"></i>
            <span>Polls</span>
          </Link>

          <Link
            to={
              poll
                ? `/results/${poll.id}`
                : "/polls"
            }
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

      <main className="vote-main">

        {/* TOPBAR */}

        <header className="vote-topbar">

          <div>

            <span className="page-label">
              CAMPUSVOTE / POLLS
            </span>

            <h1>Cast your vote</h1>

          </div>

          <div className="topbar-right">

            <button className="notification-btn">
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

        {loading ? (

          <div className="vote-loading">

            <div className="spinner-border"></div>

            <p>Loading poll...</p>

          </div>

        ) : error && !poll ? (

          <div className="vote-error-page">

            <div className="error-icon">
              <i className="bi bi-exclamation-circle"></i>
            </div>

            <h2>Unable to load poll</h2>

            <p>{error}</p>

            <Link to="/polls" className="back-polls-btn">
              <i className="bi bi-arrow-left"></i>
              Back to Polls
            </Link>

          </div>

        ) : (

          <section className="vote-content">

            {/* POLL HEADER */}

            <div className="vote-poll-header">

              <div className="vote-breadcrumb">
                <Link to="/polls">
                  Polls
                </Link>

                <i className="bi bi-chevron-right"></i>

                <span>Vote</span>
              </div>

              <div className="vote-header-row">

                <div>

                  <span
                    className={`poll-status ${status.toLowerCase()}`}
                  >
                    <span className="status-dot"></span>
                    {status}
                  </span>

                  <h2>
                    {poll.question}
                  </h2>

                  <p>
                    {poll.description ||
                      "Select one option and submit your vote."}
                  </p>

                </div>

                <div className="vote-count-box">

                  <i className="bi bi-person-check"></i>

                  <div>
                    <strong>1 vote</strong>
                    <span>per student</span>
                  </div>

                </div>

              </div>

              <div className="poll-date-info">

                <div>
                  <i className="bi bi-calendar-event"></i>

                  <span>
                    {formatDate(poll.startDate)}
                    {" — "}
                    {formatDate(poll.endDate)}
                  </span>
                </div>

              </div>

            </div>

            {/* OPTION SECTION */}

            <div className="vote-section">

              <div className="vote-section-heading">

                <div>
                  <span className="section-label">
                    YOUR CHOICE
                  </span>

                  <h3>Select one option</h3>
                </div>

                <span className="one-vote-text">
                  One vote per student
                </span>

              </div>

              <div className="vote-options">

                {(poll.options || []).map(
                  (option, index) => {

                    const letters = [
                      "A",
                      "B",
                      "C",
                      "D",
                      "E",
                      "F",
                      "G",
                      "H",
                    ];

                    const isSelected =
                      Number(selectedOption) ===
                      Number(option.id);

                    return (
                      <button
                        type="button"
                        key={option.id}
                        className={`vote-option ${
                          isSelected
                            ? "selected"
                            : ""
                        } ${
                          hasVoted
                            ? "vote-disabled"
                            : ""
                        }`}
                        onClick={() =>
                          handleOptionSelect(
                            option.id
                          )
                        }
                        disabled={hasVoted || submitting}
                      >

                        <div className="option-letter">
                          {letters[index] || index + 1}
                        </div>

                        <div className="option-name">
                          {option.optionText}
                        </div>

                        <div className="option-radio">

                          {isSelected ? (
                            <i className="bi bi-check-lg"></i>
                          ) : null}

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

              {/* ERROR */}

              {error && (
                <div className="vote-alert error">

                  <i className="bi bi-exclamation-triangle"></i>

                  <span>{error}</span>

                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="vote-alert success">

                  <i className="bi bi-check-circle"></i>

                  <span>{success}</span>

                </div>
              )}

              {/* SUBMIT BUTTON */}

              <div className="vote-submit-wrapper">

                <button
                  type="button"
                  className="vote-submit-btn"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    hasVoted ||
                    status !== "LIVE"
                  }
                >

                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Submitting...
                    </>
                  ) : hasVoted ? (
                    <>
                      Vote submitted
                      <i className="bi bi-check-circle"></i>
                    </>
                  ) : (
                    <>
                      Submit Vote
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}

                </button>

              </div>

              {/* SECURITY NOTICE */}

              <div className="vote-security">

                <div className="security-icon">
                  <i className="bi bi-shield-check"></i>
                </div>

                <div>
                  <strong>Your vote is secure</strong>

                  <span>
                    Each student can vote only once in this poll.
                  </span>
                </div>

              </div>

            </div>

          </section>

        )}

      </main>

      {/* ================= MOBILE NAV ================= */}

      <nav className="mobile-bottom-nav">

        <Link to="/dashboard">
          <i className="bi bi-grid-1x2"></i>
          <span>Home</span>
        </Link>

        <Link to="/polls" className="active">
          <i className="bi bi-bar-chart"></i>
          <span>Polls</span>
        </Link>

        <Link
          to={
            poll
              ? `/results/${poll.id}`
              : "/polls"
          }
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

export default Vote;