// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import admin pages
import Dashboard from "../pages/admin/AdminDashboard";


const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
        //   <ProtectedRoute allowedRoles={["Admin"]}>  --> Tạm thời đóng ProtectedRoute để test
            <AdminLayout />
        //   </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        // Routes chức năng khác
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
