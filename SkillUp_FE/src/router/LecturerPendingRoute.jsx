import { Navigate, useLocation } from "react-router-dom";
import { decodeToken } from "@/lib/auth-utils";

function LecturerPendingRoute({ children }) {
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");
  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeToken(accessToken);
  
  if (!decoded || decoded.roleName !== "Lecturer") {
    return <Navigate to="/login" replace />;
  }

  const status = decoded.status || decoded.Status;

  if (status === "Pending" && location.pathname !== "/lecturer/apply-cv") {
    return <Navigate to="/lecturer/apply-cv" replace />;
  }

  return children;
}

export default LecturerPendingRoute;
