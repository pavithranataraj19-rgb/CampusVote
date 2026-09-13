import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==============================
// AUTHENTICATION
// ==============================
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==============================
// STUDENT PAGES
// ==============================
import Dashboard from "./pages/Dashboard";
import Polls from "./pages/Polls";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import History from "./pages/History";
import Profile from "./pages/Profile";

// ==============================
// ADMIN PAGES
// ==============================
import AdminDashboard from "./pages/AdminDashboard";
import CreatePoll from "./pages/CreatePoll";
import ManagePolls from "./pages/ManagePolls";
import EditPoll from "./pages/EditPoll";
import AdminResults from "./pages/AdminResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            STUDENT ROUTES
        ========================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/polls"
          element={<Polls />}
        />

        <Route
          path="/vote/:id"
          element={<Vote />}
        />

        {/* STUDENT RESULTS */}
        <Route
          path="/results/:id"
          element={<Results />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/create-poll"
          element={<CreatePoll />}
        />

        <Route
          path="/admin/manage-polls"
          element={<ManagePolls />}
        />

        <Route
          path="/admin/edit-poll/:id"
          element={<EditPoll />}
        />

        <Route
          path="/admin/results/:id"
          element={<AdminResults />}
        />


        {/* =========================
            INVALID ROUTES
        ========================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;