import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./edit-poll.css";

function EditPoll() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [options, setOptions] = useState(["", ""]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // ADMIN CHECK
  // --------------------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (
        !user.role ||
        user.role.toString().toUpperCase() !== "ADMIN"
      ) {
        navigate("/login");
        return;
      }

      if (user.id) {
        localStorage.setItem("userId", user.id.toString());
      }

      localStorage.setItem("role", "ADMIN");

      loadPoll();
    } catch (err) {
      console.error("User data error:", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [id, navigate]);

  // --------------------------------------------------
  // LOAD POLL
  // --------------------------------------------------
  const loadPoll = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/polls/${id}`);

      const poll = response.data;

      setQuestion(poll.question || "");
      setDescription(poll.description || "");
      setActive(poll.active !== false);

      // Spring LocalDateTime:
      // 2026-09-13T10:30:00
      //
      // datetime-local needs:
      // 2026-09-13T10:30
      setStartDate(
        poll.startDate
          ? poll.startDate.toString().slice(0, 16)
          : ""
      );

      setEndDate(
        poll.endDate
          ? poll.endDate.toString().slice(0, 16)
          : ""
      );

      const loadedOptions = Array.isArray(poll.options)
        ? poll.options
            .map((option) => {
              if (typeof option === "string") {
                return option;
              }

              return option.optionText || "";
            })
            .filter((option) => option.trim() !== "")
        : [];

      if (loadedOptions.length >= 2) {
        setOptions(loadedOptions);
      } else {
        setOptions(["", ""]);
      }
    } catch (err) {
      console.error("Load poll error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load poll. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ERROR MESSAGE HELPER
  // --------------------------------------------------
  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    if (err?.message) {
      return err.message;
    }

    return fallback;
  };

  // --------------------------------------------------
  // OPTION CHANGE
  // --------------------------------------------------
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];

    updatedOptions[index] = value;

    setOptions(updatedOptions);
    setError("");
  };

  // --------------------------------------------------
  // ADD OPTION
  // --------------------------------------------------
  const addOption = () => {
    setOptions([...options, ""]);
  };

  // --------------------------------------------------
  // REMOVE OPTION
  // --------------------------------------------------
  const removeOption = (index) => {
    if (options.length <= 2) {
      setError("A poll must have at least 2 options.");
      return;
    }

    const updatedOptions = options.filter(
      (_, optionIndex) => optionIndex !== index
    );

    setOptions(updatedOptions);
    setError("");
  };

  // --------------------------------------------------
  // VALIDATE FORM
  // --------------------------------------------------
  const validateForm = () => {
    if (!question.trim()) {
      setError("Please enter the poll question.");
      return false;
    }

    const cleanedOptions = options
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (cleanedOptions.length < 2) {
      setError("Please provide at least 2 poll options.");
      return false;
    }

    const lowerCaseOptions = cleanedOptions.map((option) =>
      option.toLowerCase()
    );

    const uniqueOptions = new Set(lowerCaseOptions);

    if (uniqueOptions.size !== cleanedOptions.length) {
      setError("Poll options must be unique.");
      return false;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setError("End date must be after start date.");
        return false;
      }
    }

    return true;
  };

  // --------------------------------------------------
  // SAVE CHANGES
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanedOptions = options
        .map((option) => option.trim())
        .filter((option) => option !== "");

      // IMPORTANT:
      // Do NOT use toISOString().
      //
      // Spring Boot LocalDateTime expects:
      // 2026-09-13T10:30
      //
      // datetime-local already gives the correct format.
      const requestData = {
        question: question.trim(),
        description: description.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        active: active,
        options: cleanedOptions,
      };

      console.log("Updating poll:", requestData);

      const response = await API.put(
        `/polls/${id}`,
        requestData
      );

      console.log("Update response:", response.data);

      setSuccess("Poll updated successfully.");

      // Wait briefly so the user can see success message
      setTimeout(() => {
        navigate("/admin/manage-polls");
      }, 700);
    } catch (err) {
      console.error("Update poll error:", err);

      // NEVER render the complete error object.
      const message = getErrorMessage(
        err,
        "Unable to update poll. Please try again."
      );

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // CANCEL
  // --------------------------------------------------
  const handleCancel = () => {
    navigate("/admin/manage-polls");
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="edit-poll-page">
        <div className="edit-loading">
          <div className="spinner-border"></div>
          <h3>Loading poll...</h3>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------
  return (
    <div className="edit-poll-page">

      {/* SIDEBAR */}
      <aside className="edit-sidebar">

        <div className="edit-brand">
          <div className="edit-brand-icon">
            <i className="bi bi-check2-square"></i>
          </div>

          <div>
            <h2>CampusVote</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="edit-sidebar-menu">

          <button
            onClick={() => navigate("/admin")}
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/admin/create-poll")
            }
          >
            <i className="bi bi-plus-circle"></i>
            Create Poll
          </button>

          <button
            className="active"
            onClick={() =>
              navigate("/admin/manage-polls")
            }
          >
            <i className="bi bi-list-check"></i>
            Manage Polls
          </button>

          <button
            onClick={() => navigate("/dashboard")}
          >
            <i className="bi bi-person"></i>
            Student View
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>

        </nav>
      </aside>

      {/* MAIN */}
      <main className="edit-main">

        {/* HEADER */}
        <div className="edit-page-header">

          <div>
            <p className="edit-eyebrow">
              ADMINISTRATION
            </p>

            <h1>Edit Poll</h1>

            <p className="edit-subtitle">
              Update the question, options, schedule and
              status of this college poll.
            </p>
          </div>

          <button
            className="back-btn"
            onClick={handleCancel}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Polls
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="edit-alert edit-alert-error">
            <div>
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <span>{error}</span>

            <button
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="edit-alert edit-alert-success">
            <div>
              <i className="bi bi-check-circle"></i>
            </div>

            <span>{success}</span>
          </div>
        )}

        {/* FORM CARD */}
        <form
          className="edit-form-card"
          onSubmit={handleSubmit}
        >

          {/* QUESTION */}
          <div className="form-section">

            <div className="section-heading">
              <div className="section-icon">
                <i className="bi bi-chat-square-text"></i>
              </div>

              <div>
                <h3>Poll Information</h3>
                <p>
                  Update the main details of your poll.
                </p>
              </div>
            </div>

            <div className="form-group">

              <label>
                Poll Question
                <span>*</span>
              </label>

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="Enter your poll question"
                maxLength={200}
              />

              <small>
                {question.length}/200 characters
              </small>

            </div>

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add a short description about this poll"
                rows="4"
                maxLength={500}
              />

              <small>
                {description.length}/500 characters
              </small>

            </div>

          </div>

          {/* OPTIONS */}
          <div className="form-section">

            <div className="section-heading">

              <div className="section-icon">
                <i className="bi bi-list-ul"></i>
              </div>

              <div>
                <h3>Poll Options</h3>
                <p>
                  Add the choices students can vote for.
                </p>
              </div>

            </div>

            <div className="options-container">

              {options.map((option, index) => (

                <div
                  className="option-row"
                  key={index}
                >

                  <div className="option-number">
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
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
                      <i className="bi bi-trash"></i>
                    </button>
                  )}

                </div>

              ))}

            </div>

            <button
              type="button"
              className="add-option-btn"
              onClick={addOption}
            >
              <i className="bi bi-plus-lg"></i>
              Add Option
            </button>

          </div>

          {/* SCHEDULE */}
          <div className="form-section">

            <div className="section-heading">

              <div className="section-icon">
                <i className="bi bi-calendar3"></i>
              </div>

              <div>
                <h3>Poll Schedule</h3>
                <p>
                  Set when students can vote.
                </p>
              </div>

            </div>

            <div className="date-grid">

              <div className="form-group">

                <label>
                  Start Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  End Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                />

              </div>

            </div>

          </div>

          {/* STATUS */}
          <div className="form-section">

            <div className="section-heading">

              <div className="section-icon">
                <i className="bi bi-toggle-on"></i>
              </div>

              <div>
                <h3>Poll Status</h3>
                <p>
                  Control whether the poll is available
                  for voting.
                </p>
              </div>

            </div>

            <label className="status-toggle">

              <input
                type="checkbox"
                checked={active}
                onChange={(e) =>
                  setActive(e.target.checked)
                }
              />

              <span className="toggle-slider"></span>

              <div className="toggle-content">

                <strong>
                  {active
                    ? "Poll is active"
                    : "Poll is closed"}
                </strong>

                <small>
                  {active
                    ? "Students can vote according to the schedule."
                    : "Students cannot submit votes."}
                </small>

              </div>

            </label>

          </div>

          {/* ACTIONS */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >

              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </main>

      {/* MOBILE NAV */}
      <div className="edit-mobile-nav">

        <button
          onClick={() => navigate("/admin")}
        >
          <i className="bi bi-grid"></i>
          <span>Home</span>
        </button>

        <button
          onClick={() =>
            navigate("/admin/create-poll")
          }
        >
          <i className="bi bi-plus-circle"></i>
          <span>Create</span>
        </button>

        <button
          className="mobile-active"
          onClick={() =>
            navigate("/admin/manage-polls")
          }
        >
          <i className="bi bi-list-check"></i>
          <span>Polls</span>
        </button>

        <button
          onClick={() => navigate("/dashboard")}
        >
          <i className="bi bi-person"></i>
          <span>Student</span>
        </button>

      </div>

    </div>
  );
}

export default EditPoll;