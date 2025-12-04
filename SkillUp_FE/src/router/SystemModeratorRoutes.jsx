// src/routes/SystemModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import SystemModeratorLayout from "@/layouts/SystemModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

import TicketManage from "@/pages/systemModerator/TicketManage";
import LecturerApplicationManage from "@/pages/systemModerator/LecturerApplicationManage";
import SystemModeratorDashboard from "@/pages/systemModerator/SysModDashboard";
import UserManage from "@/pages/systemModerator/UserManage";
import ModProfile from "@/pages/Profile/ModProfile";

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
        <Route
          path="lecturer-application"
          element={<LecturerApplicationManage />}
        />
        <Route path="manage-user" element={<UserManage />} />
        <Route path="profile" element={<ModProfile />} />
      </Route>
    </Routes>
  );
};

export default SystemModeratorRoutes;
