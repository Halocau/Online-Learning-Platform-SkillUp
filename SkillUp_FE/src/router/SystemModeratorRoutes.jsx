// src/routes/SystemModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import SystemModeratorLayout from "@/layouts/SystemModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import moderator pages
import ModDashboard from "../pages/contentmoderator/ModDashboard";
import CategoryManage from "@/pages/systemModerator/CategoryManage";
import TicketManage from "@/pages/systemModerator/TicketManage";
import LecturerApplicationManage from "@/pages/systemModerator/LecturerApplicationManage";
import SystemModeratorDashboard from "@/pages/systemModerator/ModDashboard";

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

        <Route path="category" element={<CategoryManage />} />
        <Route path="ticket" element={<TicketManage />} />
        <Route path="lecturer-application" element={<LecturerApplicationManage />} />
      </Route>
    </Routes>
  );
};

export default SystemModeratorRoutes;