import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import HomePage from "./pages/home/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/Dashboards/admin/AdminDashboard";
import AgencyDashboard from "./pages/Dashboards/agent/AgencyDashboard";
import ResponderDashboard from "./pages/Dashboards/responder/ResponderDashboard";
import IncidentsPage from "./pages/Dashboards/agent/pages/IncidentsPage";
import IncidentDetailPage from "./pages/Dashboards/agent/pages/IncidentDetailPage";
import ServiceAdminDashboard from "./pages/Dashboards/serviceAdmin/pages/ServiceAdminDashboard";

// Responder Specific Pages
import ResponderIncidentsPage from "./pages/Dashboards/responder/pages/ResponderIncidentsPage";
import ResponderIncidentDetail from "./pages/Dashboards/responder/pages/EmergencyDetailDrawer";
import CaseDetailPage from "./pages/Dashboards/responder/pages/CaseDetailPage";

// Components
import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================
    Layout Component
========================= */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- STALE SESSION GUARD ---
  // If the backend throws a "User Not Found" error, we force a logout
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.detail?.message === "USER_NOT_FOUND_IN_DB") {
        console.warn("⚠️ Stale session detected. Clearing local storage...");
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("bahirlink-auth-error", handleGlobalError);
    return () =>
      window.removeEventListener("bahirlink-auth-error", handleGlobalError);
  }, [navigate]);

  const isDashboardBase = location.pathname.startsWith("/dashboard");
  const isIncidentDetail = location.pathname.includes("/incident/");
  const isCaseDetail = location.pathname.includes("/cases/");
  const isResponderPortal = location.pathname.startsWith(
    "/responder/incidents",
  );

  const hideNavbar =
    isDashboardBase || isIncidentDetail || isCaseDetail || isResponderPortal;

  return (
    <div className="min-h-screen bg-white">
      {!hideNavbar && <Navbar />}

      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname.split("/")[1]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="text-center">
        <h2 className="text-9xl font-black text-slate-100 mb-[-2rem]">404</h2>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-4">
          Route Terminated
        </h3>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
        >
          Return to Base
        </button>
      </div>
    </div>
  );
};

/* =========================
    Main App Component
========================= */
const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin & Service Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/service-admin"
            element={
              <ProtectedRoute role="serviceadmin">
                <ServiceAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Agency Flow */}
          <Route
            path="/dashboard/agency"
            element={
              <ProtectedRoute role="agency">
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />
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

          {/* Responder Flow */}
          <Route
            path="/dashboard/responder"
            element={
              <ProtectedRoute role="responder">
                <ResponderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/responder/incidents"
            element={
              <ProtectedRoute role="responder">
                <ResponderIncidentsPage />
              </ProtectedRoute>
            }
          >
            <Route path=":id" element={<ResponderIncidentDetail />} />
          </Route>

          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute role="responder">
                <CaseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
