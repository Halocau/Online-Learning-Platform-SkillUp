// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";


import ModeratorManage from "../pages/admin/ModeratorManage";
import AdminSalaryReport from "@/pages/admin/AdminSalaryReport";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminNotification from "@/pages/admin/AdminNotification";

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
