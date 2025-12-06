import { Navigate, useLocation } from "react-router-dom";
import { decodeToken } from "@/lib/auth-utils";

function ProtectedRoute({
  allowedRoles,
  children,
  allowLecturerAccess = false,
}) {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (allowLecturerAccess && userRole === "Lecturer") {
      return children;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  if (userRole === "Lecturer") {
    const decoded = decodeToken(token);
    const status =
      decoded?.status || decoded?.Status || user?.status || "Active";

    const allowedPaths = [
      "/lecturer/apply-cv",
      "/lecturer/applications",
      "/lecturer/profile",
    ];
    const isAllowedPath = allowedPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    if (status === "Pending" && !isAllowedPath) {
      return <Navigate to="/lecturer/apply-cv" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
