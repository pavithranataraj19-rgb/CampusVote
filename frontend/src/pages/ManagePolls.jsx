import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./manage-polls.css";

function ManagePolls() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================================================
  // CHECK ADMIN + LOAD POLLS
  // =========================================================

  useEffect(() => {
    const checkAdminAndLoadPolls = async () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const user = JSON.parse(storedUser);

        const role = String(user.role || "")
          .trim()
          .toUpperCase();

        if (role !== "ADMIN") {
          navigate("/login", { replace: true });
          return;
        }

        // Keep role and user ID available
        localStorage.setItem("role", "ADMIN");

        if (user.id) {
          localStorage.setItem("userId", String(user.id));
        }

        await fetchPolls();
      } catch (error) {
        console.error("Invalid user information:", error);

        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        navigate("/login", { replace: true });
      }
    };

    checkAdminAndLoadPolls();
  }, [navigate]);

  // =========================================================
  // FETCH POLLS
  // =========================================================

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await API.get("/polls");

      setPolls(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error loading polls:", error);

      setMessage(
        error.response?.data ||
          "Unable to load polls."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE POLL
  // =========================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this poll?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/polls/${id}`);

      setMessage("Poll deleted successfully.");

      await fetchPolls();
    } catch (error) {
      console.error("Delete error:", error);

      setMessage(
        error.response?.data ||
          "Unable to delete poll."
      );
    }
  };

  // =========================================================
  // EDIT POLL
  // =========================================================

  const handleEdit = (id) => {
    navigate(`/admin/edit-poll/${id}`);
  };

  // =========================================================
  // VIEW ADMIN RESULTS
  // =========================================================

  const handleResults = (id) => {
    navigate(`/admin/results/${id}`);
  };

  // =========================================================
  // GET POLL STATUS
  // =========================================================

  const getPollStatus = (poll) => {
    const now = new Date();

    const startDate = poll.startDate
      ? new Date(poll.startDate)
      : null;

    const endDate = poll.endDate
      ? new Date(poll.endDate)
      : null;

    // Manually closed
    if (poll.active === false) {
      return "Closed";
    }

    // Upcoming
    if (
      startDate &&
      !Number.isNaN(startDate.getTime()) &&
      now < startDate
    ) {
      return "Upcoming";
    }

    // Ended
    if (
      endDate &&
      !Number.isNaN(endDate.getTime()) &&
      now > endDate
    ) {
      return "Ended";
    }

    return "Active";
  };

  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";

      case "Upcoming":
        return "status-upcoming";

      case "Ended":
        return "status-ended";

      default:
        return "status-closed";
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "-";
      }

      return parsedDate.toLocaleString();
    } catch {
      return "-";
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login", { replace: true });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-page">

        <div className="loading-box">

          <div className="loading-spinner"></div>

          <p>
            Loading polls...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="admin-page">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="admin-sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">
            <i className="bi bi-check2-square"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Admin Panel</span>
          </div>

        </div>


        {/* SIDEBAR MENU */}

        <nav className="sidebar-menu">

          <button
            type="button"
            onClick={() => navigate("/admin")}
          >
            <i className="bi bi-grid"></i>
            <span>Dashboard</span>
          </button>


          <button
            type="button"
            onClick={() =>
              navigate("/admin/create-poll")
            }
          >
            <i className="bi bi-plus-circle"></i>
            <span>Create Poll</span>
          </button>


          <button
            type="button"
            className="active"
            onClick={() =>
              navigate("/admin/manage-polls")
            }
          >
            <i className="bi bi-list-check"></i>
            <span>Manage Polls</span>
          </button>

        </nav>


        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <div className="admin-profile">

            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>Admin Account</span>
            </div>

          </div>


          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <div className="page-header">

          <div>

            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Manage Polls
            </h1>

            <p className="page-subtitle">
              Create, edit, monitor and manage all
              college polls.
            </p>

          </div>


          <button
            type="button"
            className="create-poll-btn"
            onClick={() =>
              navigate("/admin/create-poll")
            }
          >
            <i className="bi bi-plus-lg"></i>
            Create Poll
          </button>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="admin-message">

            <div>
              <i className="bi bi-info-circle-fill"></i>

              <span>
                {message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Close message"
            >
              ×
            </button>

          </div>
        )}


        {/* =================================================
            NO POLLS
        ================================================== */}

        {polls.length === 0 ? (

          <div className="empty-box">

            <div className="empty-icon">
              <i className="bi bi-bar-chart"></i>
            </div>

            <h3>
              No polls available
            </h3>

            <p>
              Create your first college poll to
              get started.
            </p>

            <button
              type="button"
              className="create-poll-btn"
              onClick={() =>
                navigate("/admin/create-poll")
              }
            >
              <i className="bi bi-plus-lg"></i>
              Create Poll
            </button>

          </div>

        ) : (

          /* =================================================
             POLL TABLE
          ================================================== */

          <div className="poll-table-card">

            {/* TABLE HEADER */}

            <div className="table-header">

              <div>

                <p>
                  POLL MANAGEMENT
                </p>

                <h3>
                  All Polls
                </h3>

              </div>

              <span className="poll-count">
                {polls.length}
                {" "}
                {polls.length === 1
                  ? "Poll"
                  : "Polls"}
              </span>

            </div>


            {/* TABLE */}

            <div className="table-responsive">

              <table className="poll-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Poll
                    </th>

                    <th>
                      Start Date
                    </th>

                    <th>
                      End Date
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {polls.map(
                    (poll, index) => {

                      const status =
                        getPollStatus(poll);

                      return (
                        <tr
                          key={poll.id}
                        >

                          {/* NUMBER */}

                          <td>
                            <span className="row-number">
                              {index + 1}
                            </span>
                          </td>


                          {/* POLL */}

                          <td>

                            <div className="poll-info">

                              <div className="poll-icon">
                                <i className="bi bi-bar-chart-fill"></i>
                              </div>

                              <div>

                                <div className="poll-title">
                                  {poll.question}
                                </div>

                                {poll.description && (
                                  <div className="poll-description">
                                    {poll.description}
                                  </div>
                                )}

                              </div>

                            </div>

                          </td>


                          {/* START */}

                          <td>
                            <div className="date-cell">
                              {formatDate(
                                poll.startDate
                              )}
                            </div>
                          </td>


                          {/* END */}

                          <td>
                            <div className="date-cell">
                              {formatDate(
                                poll.endDate
                              )}
                            </div>
                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                status
                              )}`}
                            >

                              <span className="status-dot"></span>

                              {status}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() =>
                                  handleEdit(
                                    poll.id
                                  )
                                }
                              >
                                <i className="bi bi-pencil-square"></i>
                                Edit
                              </button>


                              <button
                                type="button"
                                className="action-btn results-btn"
                                onClick={() =>
                                  handleResults(
                                    poll.id
                                  )
                                }
                              >
                                <i className="bi bi-bar-chart"></i>
                                Results
                              </button>


                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() =>
                                  handleDelete(
                                    poll.id
                                  )
                                }
                              >
                                <i className="bi bi-trash"></i>
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </main>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          STUDENT VIEW REMOVED
      ====================================================== */}

      <div className="mobile-nav">

        <button
          type="button"
          onClick={() =>
            navigate("/admin")
          }
        >
          <i className="bi bi-grid"></i>
          <span>Home</span>
        </button>


        <button
          type="button"
          onClick={() =>
            navigate("/admin/create-poll")
          }
        >
          <i className="bi bi-plus-circle"></i>
          <span>Create</span>
        </button>


        <button
          type="button"
          className="mobile-active"
          onClick={() =>
            navigate("/admin/manage-polls")
          }
        >
          <i className="bi bi-list-check"></i>
          <span>Polls</span>
        </button>

      </div>

    </div>
  );
}

export default ManagePolls;