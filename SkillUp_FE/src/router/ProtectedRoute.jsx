// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  if (!token) return <Navigate to="/login" replace />;
   if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
