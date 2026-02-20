import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Dashboard Pages
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import AgencyDashboard from "./pages/Dashboards/AgencyDashboard";
import ResponderDashboard from "./pages/Dashboards/ResponderDashboard";

// Components
import Navbar from "./components/home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute role="Administrator">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/agency" element={
          <ProtectedRoute role="Agency Officer">
            <AgencyDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/responder" element={
          <ProtectedRoute role="Emergency Responder">
            <ResponderDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h2>404 – Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;