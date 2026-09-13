import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import API from "../services/api";
import "./admin-results.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [studentVotes, setStudentVotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      const role = String(parsedUser.role || "")
        .trim()
        .toUpperCase();

      if (role !== "ADMIN") {
        navigate("/dashboard", { replace: true });
        return;
      }

      // Store normalized admin user
      const adminUser = {
        ...parsedUser,
        role: "ADMIN",
      };

      setUser(adminUser);
      setAuthChecked(true);
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ==========================================
  // LOAD ADMIN RESULTS
  // ==========================================
  useEffect(() => {
    if (!authChecked || !user || !id) {
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          pollResponse,
          resultsResponse,
          studentResponse,
        ] = await Promise.all([
          API.get(`/polls/${id}`),
          API.get(`/votes/results/${id}`),
          API.get(`/votes/admin/results/${id}`),
        ]);

        setPoll(pollResponse.data);

        setResults(
          Array.isArray(resultsResponse.data)
            ? resultsResponse.data
            : []
        );

        setStudentVotes(
          Array.isArray(studentResponse.data)
            ? studentResponse.data
            : []
        );
      } catch (err) {
        console.error("Failed to load admin results:", err);

        setError(
          err?.response?.data ||
            "Unable to load poll results."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [authChecked, user, id]);

  // ==========================================
  // TOTAL VOTES
  // ==========================================
  const totalVotes = results.reduce(
    (total, item) =>
      total + Number(item.voteCount || 0),
    0
  );

  // ==========================================
  // LEADING OPTION
  // ==========================================
  const leadingOption =
    results.length > 0
      ? results.reduce((leader, current) =>
          Number(current.voteCount || 0) >
          Number(leader.voteCount || 0)
            ? current
            : leader
        )
      : null;

  // ==========================================
  // CHART DATA
  // ==========================================
  const chartData = {
    labels: results.map(
      (item) => item.optionText
    ),

    datasets: [
      {
        label: "Votes",

        data: results.map(
          (item) => Number(item.voteCount || 0)
        ),

        borderWidth: 1,
      },
    ],
  };

  // ==========================================
  // CHART OPTIONS
  // ==========================================
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Voting Breakdown",
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login", { replace: true });
  };

  // ==========================================
  // AUTH CHECK LOADING
  // ==========================================
  if (!authChecked || !user) {
    return (
      <div className="admin-results-loading">
        <div
          className="spinner-border"
          role="status"
        ></div>

        <p>Checking Admin Access...</p>
      </div>
    );
  }

  // ==========================================
  // RESULTS LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="admin-results-loading">
        <div
          className="spinner-border"
          role="status"
        ></div>

        <p>Loading results...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="admin-results-page">

      {/* =====================================
          SIDEBAR
      ====================================== */}
      <aside className="admin-results-sidebar">

        {/* BRAND */}
        <div className="admin-results-brand">

          <div className="brand-icon">
            <i className="bi bi-bar-chart-fill"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Admin Panel</span>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="admin-results-nav">

          <button
            onClick={() =>
              navigate("/admin")
            }
          >
            <i className="bi bi-grid-1x2-fill"></i>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/admin/create-poll")
            }
          >
            <i className="bi bi-plus-circle-fill"></i>
            Create Poll
          </button>

          <button
            onClick={() =>
              navigate("/admin/manage-polls")
            }
          >
            <i className="bi bi-list-check"></i>
            Manage Polls
          </button>

          <button className="active">
            <i className="bi bi-bar-chart-fill"></i>
            Results
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="admin-results-sidebar-bottom">

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            <i className="bi bi-person-circle"></i>
            Profile
          </button>

          <button onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <main className="admin-results-main">

        {/* HEADER */}
        <header className="admin-results-header">

          <div>

            <button
              className="admin-results-back"
              onClick={() =>
                navigate("/admin/manage-polls")
              }
            >
              <i className="bi bi-arrow-left"></i>
              Back to Manage Polls
            </button>

            <h1>Poll Results</h1>

            <p>
              View voting performance and student
              participation
            </p>

          </div>

        </header>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* =====================================
            POLL INFORMATION
        ====================================== */}
        {poll && (
          <section className="admin-results-poll-card">

            <div className="poll-card-icon">
              <i className="bi bi-bar-chart-line-fill"></i>
            </div>

            <div className="poll-card-content">

              <span className="poll-card-label">
                POLL QUESTION
              </span>

              <h2>
                {poll.question}
              </h2>

              {poll.description && (
                <p>
                  {poll.description}
                </p>
              )}

            </div>

          </section>
        )}

        {/* =====================================
            SUMMARY CARDS
        ====================================== */}
        <section className="admin-results-summary">

          {/* STUDENTS VOTED */}
          <div className="result-summary-card">

            <div className="summary-icon">
              <i className="bi bi-people-fill"></i>
            </div>

            <div>
              <span>Students Voted</span>

              <strong>
                {studentVotes.length}
              </strong>
            </div>

          </div>

          {/* TOTAL VOTES */}
          <div className="result-summary-card">

            <div className="summary-icon">
              <i className="bi bi-check2-circle"></i>
            </div>

            <div>
              <span>Total Votes</span>

              <strong>
                {totalVotes}
              </strong>
            </div>

          </div>

          {/* LEADING OPTION */}
          <div className="result-summary-card">

            <div className="summary-icon">
              <i className="bi bi-trophy-fill"></i>
            </div>

            <div>
              <span>Leading Option</span>

              <strong>
                {leadingOption
                  ? leadingOption.optionText
                  : "No votes yet"}
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================
            CHART + BREAKDOWN
        ====================================== */}
        <section className="admin-results-grid">

          {/* CHART */}
          <div className="admin-results-chart-card">

            <div className="section-heading">

              <div>

                <h3>
                  Vote Distribution
                </h3>

                <p>
                  Visual breakdown of votes
                </p>

              </div>

            </div>

            <div className="admin-chart-container">

              {results.length > 0 ? (
                <Bar
                  data={chartData}
                  options={chartOptions}
                />
              ) : (
                <div className="no-results">

                  <i className="bi bi-bar-chart"></i>

                  <p>
                    No votes have been submitted yet.
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* OPTION BREAKDOWN */}
          <div className="admin-results-breakdown-card">

            <div className="section-heading">

              <div>

                <h3>
                  Option Breakdown
                </h3>

                <p>
                  Votes and percentages
                </p>

              </div>

            </div>

            <div className="option-breakdown-list">

              {results.map((item) => {

                const percentage =
                  Number(item.percentage || 0);

                const voteCount =
                  Number(item.voteCount || 0);

                return (
                  <div
                    className="option-result-item"
                    key={item.optionId}
                  >

                    <div className="option-result-top">

                      <span className="option-result-name">
                        {item.optionText}
                      </span>

                      <span className="option-result-votes">
                        {voteCount} votes
                      </span>

                    </div>

                    <div className="progress option-progress">

                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>

                    </div>

                    <div className="option-result-percentage">
                      {percentage.toFixed(1)}%
                    </div>

                  </div>
                );
              })}

              {results.length === 0 && (
                <div className="empty-breakdown">
                  No voting data available.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =====================================
            STUDENT VOTING DETAILS
        ====================================== */}
        <section className="admin-student-votes-card">

          <div className="section-heading student-heading">

            <div>

              <h3>
                Student Voting Details
              </h3>

              <p>
                See which option each student selected
              </p>

            </div>

            <span className="student-count-badge">
              {studentVotes.length} Students
            </span>

          </div>

          {studentVotes.length === 0 ? (

            <div className="no-student-votes">

              <i className="bi bi-person-x"></i>

              <h4>
                No students have voted yet
              </h4>

              <p>
                Student voting details will appear
                here after votes are submitted.
              </p>

            </div>

          ) : (

            <div className="student-table-wrapper">

              <table className="student-votes-table">

                <thead>

                  <tr>

                    <th>#</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Selected Option</th>
                    <th>Voted At</th>

                  </tr>

                </thead>

                <tbody>

                  {studentVotes.map(
                    (vote, index) => (

                      <tr
                        key={
                          `${vote.studentId}-${vote.optionId}-${index}`
                        }
                      >

                        {/* NUMBER */}
                        <td>
                          {index + 1}
                        </td>

                        {/* STUDENT */}
                        <td>

                          <div className="student-name-cell">

                            <div className="student-avatar">

                              {vote.studentName
                                ? vote.studentName
                                    .charAt(0)
                                    .toUpperCase()
                                : "S"}

                            </div>

                            <strong>
                              {vote.studentName ||
                                "Unknown Student"}
                            </strong>

                          </div>

                        </td>

                        {/* EMAIL */}
                        <td>
                          {vote.email || "-"}
                        </td>

                        {/* OPTION */}
                        <td>

                          <span className="selected-option-badge">
                            {vote.optionText || "-"}
                          </span>

                        </td>

                        {/* DATE */}
                        <td>
                          {formatDateTime(
                            vote.votedAt
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* =====================================
          MOBILE NAVIGATION
      ====================================== */}
      <nav className="admin-results-mobile-nav">

        <button
          onClick={() =>
            navigate("/admin")
          }
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Home</span>
        </button>

        <button
          onClick={() =>
            navigate("/admin/create-poll")
          }
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Create</span>
        </button>

        <button
          onClick={() =>
            navigate("/admin/manage-polls")
          }
        >
          <i className="bi bi-list-check"></i>
          <span>Polls</span>
        </button>

        <button className="active">
          <i className="bi bi-bar-chart-fill"></i>
          <span>Results</span>
        </button>

      </nav>

    </div>
  );
}

export default AdminResults;