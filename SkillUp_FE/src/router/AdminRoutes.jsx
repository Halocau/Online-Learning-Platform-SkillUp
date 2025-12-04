// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/admin/AdminDashboard";
import ModeratorManage from "../pages/admin/ModeratorManage";
import AdminSalaryReport from "@/pages/admin/AdminSalaryReport";

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
        <Route index element={<Dashboard />} />
        <Route path="moderators" element={<ModeratorManage />} />
        <Route path="salary-report" element={<AdminSalaryReport />} />
        {/* Other admin routes */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
