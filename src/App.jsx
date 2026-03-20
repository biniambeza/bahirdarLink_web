import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/Dashboards/admin/AdminDashboard";
import AgencyDashboard from "./pages/Dashboards/agent/AgencyDashboard";

// Components
import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout component
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.includes("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {!isDashboard && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Agency Dashboard */}
          <Route
            path="/dashboard/agency"
            element={
              <ProtectedRoute role="agency">
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                  >
                    404
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Page Not Found
                  </h2>
                  <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
                  >
                    Go Back Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
