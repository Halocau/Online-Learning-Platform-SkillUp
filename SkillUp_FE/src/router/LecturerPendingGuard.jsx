import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { decodeToken } from "@/lib/auth-utils.js";

function LecturerPendingGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.role === "Lecturer") {
      const decoded = decodeToken(token);
      const status = decoded?.status || decoded?.Status || user?.status || 'Active';

      const allowedPaths = ["/lecturer/apply-cv", "/lecturer/applications"];
      const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));

      if (status === "Pending" && !isAllowedPath) {
        navigate("/lecturer/apply-cv", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return children;
}

export default LecturerPendingGuard;
