import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/admin-dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (
        String(parsedUser.role || "")
          .trim()
          .toUpperCase() !== "ADMIN"
      ) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setUser({
        ...parsedUser,
        role: "ADMIN",
      });

      loadPolls();
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const loadPolls = async () => {
    try {
      setLoading(true);

      const response = await API.get("/polls");

      setPolls(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load polls:", error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login", { replace: true });
  };

  const getStatus = (poll) => {
    if (poll.active === true) {
      return "Active";
    }

    if (poll.active === false) {
      return "Closed";
    }

    return "Unknown";
  };

  const getStatusClass = (poll) => {
    if (poll.active === true) {
      return "active";
    }

    return "closed";
  };

  return (
    <div className="admin-layout">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="admin-sidebar">

        {/* Logo */}

        <div className="admin-brand">
          <div className="brand-logo">
            CV
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Admin Panel</span>
          </div>
        </div>


        {/* Navigation */}

        <nav className="admin-navigation">

          <Link
            to="/admin"
            className="admin-nav-item active"
          >
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </Link>


          <Link
            to="/admin/create-poll"
            className="admin-nav-item"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Poll</span>
          </Link>


          <Link
            to="/admin/manage-polls"
            className="admin-nav-item"
          >
            <i className="bi bi-list-check"></i>
            <span>Manage Polls</span>
          </Link>


          {/* 
             STUDENT VIEW REMOVED
             
             Do NOT add:
             <Link to="/dashboard">Student View</Link>
          */}

        </nav>


        {/* Admin Profile / Logout */}

        <div className="admin-sidebar-bottom">

          <div className="admin-user">

            <div className="admin-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="admin-user-info">
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>


          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="admin-main">

        {/* Header */}

        <header className="admin-header">

          <div>
            <p className="admin-eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Dashboard
            </h1>

            <p className="admin-subtitle">
              Manage campus polls and monitor voting activity.
            </p>
          </div>


          <div className="admin-header-actions">

            <Link
              to="/admin/create-poll"
              className="create-poll-btn"
            >
              <i className="bi bi-plus-lg"></i>
              Create Poll
            </Link>

          </div>

        </header>


        {/* =========================
            STAT CARDS
        ========================== */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="stat-icon">
              <i className="bi bi-bar-chart-fill"></i>
            </div>

            <div>
              <span>Total Polls</span>

              <strong>
                {polls.length}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            <div>
              <span>Active Polls</span>

              <strong>
                {
                  polls.filter(
                    (poll) => poll.active === true
                  ).length
                }
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon">
              <i className="bi bi-pause-circle-fill"></i>
            </div>

            <div>
              <span>Closed Polls</span>

              <strong>
                {
                  polls.filter(
                    (poll) => poll.active === false
                  ).length
                }
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>

            <div>
              <span>System</span>

              <strong>
                Live
              </strong>
            </div>

          </div>

        </section>


        {/* =========================
            RECENT POLLS
        ========================== */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <p className="panel-eyebrow">
                POLL MANAGEMENT
              </p>

              <h2>
                Recent Polls
              </h2>
            </div>


            <Link
              to="/admin/manage-polls"
              className="view-all-btn"
            >
              View All
              <i className="bi bi-arrow-right"></i>
            </Link>

          </div>


          {/* Loading */}

          {loading ? (

            <div className="admin-empty-state">

              <div className="loading-spinner"></div>

              <p>
                Loading polls...
              </p>

            </div>

          ) : polls.length === 0 ? (

            /* No polls */

            <div className="admin-empty-state">

              <div className="empty-icon">
                <i className="bi bi-bar-chart"></i>
              </div>

              <h3>
                No polls available
              </h3>

              <p>
                Create your first poll to start collecting votes.
              </p>

              <Link
                to="/admin/create-poll"
                className="create-poll-btn"
              >
                <i className="bi bi-plus-lg"></i>
                Create First Poll
              </Link>

            </div>

          ) : (

            /* Poll table */

            <div className="poll-table-wrapper">

              <table className="poll-table">

                <thead>

                  <tr>

                    <th>
                      Poll
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Start Date
                    </th>

                    <th>
                      End Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {polls
                    .slice(0, 5)
                    .map((poll) => (

                      <tr key={poll.id}>

                        {/* Poll */}

                        <td>

                          <div className="poll-name-cell">

                            <div className="poll-icon">
                              <i className="bi bi-bar-chart-fill"></i>
                            </div>

                            <div>

                              <strong>
                                {poll.question}
                              </strong>

                              {poll.description && (
                                <span>
                                  {poll.description}
                                </span>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* Status */}

                        <td>

                          <span
                            className={`poll-status ${getStatusClass(
                              poll
                            )}`}
                          >
                            <span className="status-dot"></span>

                            {getStatus(poll)}

                          </span>

                        </td>


                        {/* Start Date */}

                        <td>
                          {poll.startDate
                            ? new Date(
                                poll.startDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>


                        {/* End Date */}

                        <td>
                          {poll.endDate
                            ? new Date(
                                poll.endDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>


                        {/* Actions */}

                        <td>

                          <div className="poll-actions">

                            {/* ADMIN VIEW ONLY */}

                            <Link
                              to={`/admin/results/${poll.id}`}
                              className="table-action view"
                              title="View Results"
                            >
                              <i className="bi bi-eye-fill"></i>
                              View
                            </Link>


                            <Link
                              to={`/admin/edit-poll/${poll.id}`}
                              className="table-action edit"
                              title="Edit Poll"
                            >
                              <i className="bi bi-pencil-fill"></i>
                              Edit
                            </Link>

                          </div>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;