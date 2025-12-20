// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";


import ModeratorManage from "../pages/admin/ModeratorManage.jsx";
import AdminSalaryReport from "@/pages/admin/AdminSalaryReport.jsx";
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
        <Route index element={<AdminSalaryReport />} />
        <Route path="moderators" element={<ModeratorManage />} />
        <Route path="notifications" element={<AdminNotification />} />
        <Route path="salary-report" element={<AdminSalaryReport />} />
        {/* Other admin routes */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
