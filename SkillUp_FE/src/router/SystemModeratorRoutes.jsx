// src/routes/SystemModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import SystemModeratorLayout from "@/layouts/SystemModeratorLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import TicketManage from "@/pages/systemModerator/TicketManage.jsx";
import LecturerApplicationManage from "@/pages/systemModerator/LecturerApplicationManage.jsx";
import SystemModeratorDashboard from "@/pages/systemModerator/SysModDashboard.jsx";
import UserManage from "@/pages/systemModerator/UserManage.jsx";
import ModProfile from "@/pages/Profile/ModProfile.jsx";

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
