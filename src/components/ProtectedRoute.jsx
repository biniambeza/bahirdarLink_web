import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  // Get user and agency from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const agency = JSON.parse(localStorage.getItem("agency"));

  // If role is admin, check user
  if (role === "admin") {
    if (!user || user.role !== "admin") {
      return <Navigate to="/login" replace />;
    }
  }

  // If role is agency, check agency
  if (role === "agency") {
    if (!agency) {
      return <Navigate to="/login" replace />;
    }
  }

  // Authenticated and role matches
  return children;
};

export default ProtectedRoute;
