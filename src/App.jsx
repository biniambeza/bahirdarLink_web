import React, { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import("./pages/home/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AdminDashboard = lazy(() => import("./pages/Dashboards/admin/AdminDashboard"));
const AgencyDashboard = lazy(() => import("./pages/Dashboards/agent/AgencyDashboard"));
const ResponderDashboard = lazy(() => import("./pages/Dashboards/responder/ResponderDashboard"));
const ServiceAdminDashboard = lazy(() => import("./pages/Dashboards/serviceAdmin/pages/ServiceAdminDashboard"));
const IncidentsPage = lazy(() => import("./pages/Dashboards/agent/pages/IncidentsPage"));
const IncidentDetailPage = lazy(() => import("./pages/Dashboards/agent/pages/IncidentDetailPage"));
const EditAgentPage = lazy(() => import("./pages/Dashboards/admin/pages/EditAgentPage"));
const ResponderIncidentsPage = lazy(() => import("./pages/Dashboards/responder/pages/ResponderIncidentsPage"));
const ResponderIncidentDetail = lazy(() => import("./pages/Dashboards/responder/pages/EmergencyDetailDrawer"));
const CaseDetailPage = lazy(() => import("./pages/Dashboards/responder/pages/CaseDetailPage"));

import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-25" />
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
    <span className="mt-3 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
      Loading
    </span>
  </div>
);

const INTERNAL_ROUTES = [
  "/login",
  "/dashboard",
  "/edit-agent",
  "/incidents",
  "/cases",
  "/responder",
];

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handle = (e) => {
      if (e.detail?.message === "USER_NOT_FOUND_IN_DB") {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("bahirlink-auth-error", handle);
    return () => window.removeEventListener("bahirlink-auth-error", handle);
  }, [navigate]);

  const hideNavbar = INTERNAL_ROUTES.some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <div className="min-h-screen bg-white">
      {!hideNavbar && <Navbar />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white text-center">
      <div className="max-w-md">
        <h2 className="text-9xl font-black text-slate-100 mb-[-2rem] select-none">
          404
        </h2>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-4">
          Route Terminated
        </h3>
        <p className="text-slate-500 mb-8">
          The coordinate you are looking for does not exist in our database.
        </p>
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
