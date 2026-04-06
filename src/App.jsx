import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/Dashboards/admin/AdminDashboard";
import AgencyDashboard from "./pages/Dashboards/agent/AgencyDashboard";
import ResponderDashboard from "./pages/Dashboards/responder/ResponderDashboard";
import IncidentsPage from "./pages/Dashboards/agent/pages/IncidentsPage";
import IncidentDetailPage from "./pages/Dashboards/agent/pages/IncidentDetailPage";

// Components
import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================
   Layout Component
========================= */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Show Navbar only on non-dashboard pages */}
      {!isDashboard && <Navbar />}

      {/* Animate route transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* =========================
   404 Page Component
========================= */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

/* =========================
   Main App Component
========================= */
const App = () => {
  // Smooth scrolling for the entire app
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* ========= Public Routes ========= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ========= Admin Dashboard ========= */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========= Agency Dashboard ========= */}
          <Route
            path="/dashboard/agency"
            element={
              <ProtectedRoute role="agency">
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========= Responder Dashboard ========= */}
          <Route
            path="/dashboard/responder"
            element={
              <ProtectedRoute role="responder">
                <ResponderDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========= Agency Incidents ========= */}
          <Route
            path="/incidents"
            element={
              <ProtectedRoute role="agency">
                <IncidentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute role="agency">
                <IncidentDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ========= 404 Not Found ========= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
