import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {

  const user = JSON.parse(localStorage.getItem("user"));
  const agency = JSON.parse(localStorage.getItem("agency"));

  if (role === "admin") {
    if (!user || user.role !== "admin") {
      return <Navigate to="/login" replace />;
    }
  }

  if (role === "agency") {
    if (!agency) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
