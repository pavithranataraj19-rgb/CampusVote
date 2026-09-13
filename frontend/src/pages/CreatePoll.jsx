import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/create-poll.css";

function CreatePoll() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  const [options, setOptions] = useState([
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================
  // CHECK ADMIN
  // ============================
  if (!storedUser) {
    navigate("/login");
    return null;
  }

  if (storedUser.role !== "ADMIN") {
    navigate("/dashboard");
    return null;
  }

  // ============================
  // ADD OPTION
  // ============================
  const addOption = () => {
    setOptions([...options, ""]);
  };

  // ============================
  // REMOVE OPTION
  // ============================
  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions(
      options.filter((_, optionIndex) => optionIndex !== index)
    );
  };

  // ============================
  // UPDATE OPTION
  // ============================
  const updateOption = (index, value) => {
    const updatedOptions = [...options];

    updatedOptions[index] = value;

    setOptions(updatedOptions);
  };

  // ============================
  // SUBMIT POLL
  // ============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // Question validation
    if (!question.trim()) {
      setError("Please enter a poll question.");
      return;
    }

    // Options validation
    const cleanedOptions = options
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (cleanedOptions.length < 2) {
      setError("Please provide at least 2 poll options.");
      return;
    }

    // Duplicate option validation
    const uniqueOptions = new Set(
      cleanedOptions.map((option) => option.toLowerCase())
    );

    if (uniqueOptions.size !== cleanedOptions.length) {
      setError("Poll options must be different.");
      return;
    }

    // Date validation
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setError(
          "End date and time must be after the start date and time."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const pollData = {
        question: question.trim(),
        description: description.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        active: active,
        createdById: storedUser.id,
        options: cleanedOptions,
      };

      console.log("Creating poll:", pollData);

      await API.post("/polls", pollData);

      setMessage("Poll created successfully.");

      // Clear form
      setQuestion("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setActive(true);
      setOptions(["", ""]);

      // Go to manage polls after short delay
      setTimeout(() => {
        navigate("/admin/manage-polls");
      }, 1200);
    } catch (err) {
      console.error("Create poll error:", err);

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to create poll.");
        }
      } else {
        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOGOUT
  // ============================
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="create-poll-page">

      {/* =================================
          SIDEBAR
      ================================== */}
      <aside className="create-poll-sidebar">

        <div className="create-poll-brand">

          <div className="create-poll-logo">
            <i className="bi bi-check2-square"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Admin Portal</span>
          </div>

        </div>

        <div className="create-poll-menu-title">
          ADMIN MENU
        </div>

        <nav className="create-poll-nav">

          <Link to="/admin">
            <i className="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/create-poll"
            className="active"
          >
            <i className="bi bi-plus-square"></i>
            <span>Create Poll</span>
          </Link>

          <Link to="/admin/manage-polls">
            <i className="bi bi-list-check"></i>
            <span>Manage Polls</span>
          </Link>

        </nav>

        <div className="create-poll-sidebar-bottom">

          <div className="create-poll-admin-box">

            <div className="create-poll-admin-icon">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <strong>Administrator</strong>
              <span>Full access enabled</span>
            </div>

          </div>

          <button
            className="create-poll-logout"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left"></i>
            Sign out
          </button>

        </div>

      </aside>

      {/* =================================
          MAIN
      ================================== */}
      <main className="create-poll-main">

        {/* TOP BAR */}
        <header className="create-poll-topbar">

          <div>

            <span className="create-poll-breadcrumb">
              CAMPUSVOTE / ADMIN / CREATE POLL
            </span>

            <h1>Create New Poll</h1>

          </div>

          <div className="create-poll-user">

            <div className="create-poll-avatar">
              {storedUser.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div>
              <strong>{storedUser.name}</strong>
              <small>Administrator</small>
            </div>

          </div>

        </header>

        {/* CONTENT */}
        <section className="create-poll-content">

          <div className="create-poll-heading">

            <div>

              <span>NEW POLL</span>

              <h2>
                Create a campus voting poll
              </h2>

              <p>
                Add your question, voting options,
                and schedule the poll for students.
              </p>

            </div>

            <Link
              to="/admin/manage-polls"
              className="back-to-polls"
            >
              <i className="bi bi-arrow-left"></i>
              Manage Polls
            </Link>

          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="create-poll-success">
              <i className="bi bi-check-circle-fill"></i>
              <span>{message}</span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="create-poll-error">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form
            className="create-poll-form"
            onSubmit={handleSubmit}
          >

            {/* =================================
                BASIC INFORMATION
            ================================== */}
            <div className="create-poll-card">

              <div className="create-poll-card-header">

                <div className="create-poll-card-icon">
                  <i className="bi bi-question-circle"></i>
                </div>

                <div>
                  <h3>Poll Information</h3>
                  <p>
                    Define what students will vote on.
                  </p>
                </div>

              </div>

              <div className="create-poll-fields">

                {/* QUESTION */}
                <div className="create-poll-field full-width">

                  <label>
                    Poll Question
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    placeholder="Example: Who should be the Student Council President?"
                    maxLength={200}
                  />

                  <small>
                    {question.length}/200 characters
                  </small>

                </div>

                {/* DESCRIPTION */}
                <div className="create-poll-field full-width">

                  <label>
                    Description
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Add a short description or instructions for students..."
                    rows="4"
                    maxLength={500}
                  />

                  <small>
                    {description.length}/500 characters
                  </small>

                </div>

              </div>

            </div>

            {/* =================================
                OPTIONS
            ================================== */}
            <div className="create-poll-card">

              <div className="create-poll-card-header">

                <div className="create-poll-card-icon">
                  <i className="bi bi-ui-radios"></i>
                </div>

                <div>
                  <h3>Voting Options</h3>
                  <p>
                    Add at least two choices for students.
                  </p>
                </div>

              </div>

              <div className="create-poll-options">

                {options.map((option, index) => (

                  <div
                    className="create-poll-option-row"
                    key={index}
                  >

                    <div className="option-number">
                      {index + 1}
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        updateOption(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Option ${index + 1}`}
                      maxLength={150}
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        className="remove-option-btn"
                        onClick={() =>
                          removeOption(index)
                        }
                        title="Remove option"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}

                  </div>

                ))}

                <button
                  type="button"
                  className="add-option-btn"
                  onClick={addOption}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Another Option
                </button>

              </div>

            </div>

            {/* =================================
                SCHEDULE
            ================================== */}
            <div className="create-poll-card">

              <div className="create-poll-card-header">

                <div className="create-poll-card-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>

                <div>
                  <h3>Poll Schedule</h3>
                  <p>
                    Choose when students can vote.
                  </p>
                </div>

              </div>

              <div className="create-poll-fields two-columns">

                {/* START */}
                <div className="create-poll-field">

                  <label>
                    Start Date & Time
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                  />

                </div>

                {/* END */}
                <div className="create-poll-field">

                  <label>
                    End Date & Time
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                  />

                </div>

              </div>

              {/* ACTIVE TOGGLE */}
              <div className="poll-active-setting">

                <div className="poll-active-info">

                  <div className="poll-active-icon">
                    <i className="bi bi-broadcast"></i>
                  </div>

                  <div>
                    <strong>
                      Make poll active
                    </strong>

                    <span>
                      Students can vote when the
                      poll is active and within its
                      scheduled time.
                    </span>
                  </div>

                </div>

                <label className="toggle-switch">

                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(event) =>
                      setActive(event.target.checked)
                    }
                  />

                  <span className="toggle-slider"></span>

                </label>

              </div>

            </div>

            {/* =================================
                ACTIONS
            ================================== */}
            <div className="create-poll-actions">

              <Link
                to="/admin"
                className="cancel-poll-btn"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-poll-btn"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating Poll...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    Create Poll
                  </>
                )}

              </button>

            </div>

          </form>

          {/* FOOTER */}
          <footer className="create-poll-footer">

            <span>
              © 2026 CampusVote
            </span>

            <span>
              Online College Poll & Voting System
            </span>

          </footer>

        </section>

      </main>

      {/* =================================
          MOBILE NAV
      ================================== */}
      <nav className="create-poll-mobile-nav">

        <Link to="/admin">
          <i className="bi bi-grid-1x2"></i>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/create-poll"
          className="active"
        >
          <i className="bi bi-plus-square"></i>
          <span>Create</span>
        </Link>

        <Link to="/admin/manage-polls">
          <i className="bi bi-list-check"></i>
          <span>Polls</span>
        </Link>

        <button onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>

      </nav>

    </div>
  );
}

export default CreatePoll;