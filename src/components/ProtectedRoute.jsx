import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const agency = JSON.parse(localStorage.getItem("agency"));
  const serviceAdmin = JSON.parse(localStorage.getItem("serviceAdmin"));

  // ADMIN
  if (role === "admin") {
    if (!user || user.role !== "admin") {
      return <Navigate to="/login" replace />;
    }
  }

  // SERVICE ADMIN (NEW)
  if (role === "serviceadmin") {
    if (!user || user.role !== "serviceadmin") {
      return <Navigate to="/login" replace />;
    }
  }

  // AGENCY
  if (role === "agency") {
    if (!agency) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
