// src/routes/SystemModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import SystemModeratorLayout from "@/layouts/SystemModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import moderator pages
import ModDashboard from "../pages/contentmoderator/ModDashboard";
import TicketManage from "@/pages/systemModerator/TicketManage";
import LecturerApplicationManage from "@/pages/systemModerator/LecturerApplicationManage";
import SystemModeratorDashboard from "@/pages/systemModerator/ModDashboard";
import UserManage from "@/pages/systemModerator/UserManage";

const SystemModeratorRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["System Morderator"]}>
            <SystemModeratorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SystemModeratorDashboard />} />

        <Route path="ticket" element={<TicketManage />} />
        <Route path="lecturer-application" element={<LecturerApplicationManage />} />
        <Route path="manage-user" element={<UserManage />} />
      </Route>
    </Routes>
  );
};

export default SystemModeratorRoutes;