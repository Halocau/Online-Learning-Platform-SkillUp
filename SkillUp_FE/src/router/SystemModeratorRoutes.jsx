// src/routes/ModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ModeratorLayout from "../layouts/ContentModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import moderator pages
import ModDashboard from "../pages/contentmoderator/ModDashboard";
import SystemModeratorLayout from "@/layouts/SystemModeratorLayout";



const SystemModeratorRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
        //   <ProtectedRoute allowedRoles={["Moderator"]}> --> Tạm thời đóng ProtectedRoute để test
            <SystemModeratorLayout />
        //   </ProtectedRoute>
        }
      >
        <Route index element={<ModDashboard />} />
        
        // Routes chức năng khác
      </Route>
    </Routes>
  );
};

export default SystemModeratorRoutes;
