// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";


import ModeratorManage from "../pages/admin/ModeratorManage.jsx";
import AdminSalaryReport from "@/pages/admin/AdminSalaryReport.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminNotification from "@/pages/admin/AdminNotification.jsx";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="moderators" element={<ModeratorManage />} />
        <Route path="salary-report" element={<AdminSalaryReport />} />
        <Route path="notifications" element={<AdminNotification />} />
        {/* Other admin routes */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
