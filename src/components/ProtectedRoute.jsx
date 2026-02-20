import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role doesn't match, redirect to home
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and role matches, render the component
  return children;
};

export default ProtectedRoute;