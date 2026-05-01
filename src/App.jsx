import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- PAGES ---
import HomePage from "./pages/home/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/auth/LoginPage";

// --- DASHBOARDS ---
import AdminDashboard from "./pages/Dashboards/admin/AdminDashboard";
import AgencyDashboard from "./pages/Dashboards/agent/AgencyDashboard";
import ResponderDashboard from "./pages/Dashboards/responder/ResponderDashboard";
import ServiceAdminDashboard from "./pages/Dashboards/serviceAdmin/pages/ServiceAdminDashboard";

// --- AGENCY SPECIFIC ---
import IncidentsPage from "./pages/Dashboards/agent/pages/IncidentsPage";
import IncidentDetailPage from "./pages/Dashboards/agent/pages/IncidentDetailPage";
import EditAgentPage from "./pages/Dashboards/admin/pages/EditAgentPage"; 

// --- RESPONDER SPECIFIC ---
import ResponderIncidentsPage from "./pages/Dashboards/responder/pages/ResponderIncidentsPage";
import ResponderIncidentDetail from "./pages/Dashboards/responder/pages/EmergencyDetailDrawer";
import CaseDetailPage from "./pages/Dashboards/responder/pages/CaseDetailPage";

// --- COMPONENTS ---
import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

/* ============================================================
    LAYOUT COMPONENT
    Handles global listeners and conditional UI (Navbar)
============================================================ */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // STALE SESSION GUARD: Listen for custom auth errors from axios interceptors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.detail?.message === "USER_NOT_FOUND_IN_DB") {
        console.warn("⚠️ Stale session detected. Redirecting to login...");
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("bahirlink-auth-error", handleGlobalError);
    return () => window.removeEventListener("bahirlink-auth-error", handleGlobalError);
  }, [navigate]);

  // Determine if the Navbar should be hidden
  // We hide it for all Dashboard, Login, and Detail-view internal routes
  const internalRoutes = [
    "/login",
    "/dashboard",
    "/edit-agent",
    "/incidents",
    "/cases",
    "/responder"
  ];
  
  const hideNavbar = internalRoutes.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-white">
      {!hideNavbar && <Navbar />}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ============================================================
    404 NOT FOUND
============================================================ */
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white text-center">
      <div className="max-w-md">
        <h2 className="text-9xl font-black text-slate-100 mb-[-2rem] select-none">404</h2>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-4">
          Route Terminated
        </h3>
        <p className="text-slate-500 mb-8">The coordinate you are looking for does not exist in our database.</p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
        >
          Return to Base
        </button>
      </div>
    </div>
  );
};

/* ============================================================
    MAIN APP
============================================================ */
const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- ADMIN & SERVICE ADMIN --- */}
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

          {/* --- AGENCY FLOW --- */}
          <Route
            path="/dashboard/agency"
            element={
              <ProtectedRoute role="agency">
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-agent/:id"
            element={
              <ProtectedRoute role="agency">
                <EditAgentPage />
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

          {/* --- RESPONDER FLOW --- */}
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
            {/* Nested Detail View for Responder Drawer */}
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

          {/* --- FALLBACK --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;