// src/routes/ModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ModeratorLayout from "../layouts/ModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import moderator pages
import ModDashboard from "../pages/moderator/ModDashboard";
import TicketManage from "@/pages/moderator/TicketManage";
import NewsManage from "@/pages/moderator/NewsManage";
import CommentReport from "@/pages/moderator/CommentReport";


const ModeratorRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["Moderator"]}>
            <ModeratorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ModDashboard />} />
        <Route path="news" element={<NewsManage />} />
        <Route path="tickets" element={<TicketManage />} />
        <Route path="cmt" element={<CommentReport />} />
        // Routes chức năng khác
      </Route>
    </Routes>
  );
};

export default ModeratorRoutes;
