// src/routes/ModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ModeratorLayout from "../layouts/ContentModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

// Import moderator pages
import ModDashboard from "../pages/contentmoderator/ModDashboard";
import TicketManage from "@/pages/contentmoderator/TicketManage";
import NewsManage from "@/pages/contentmoderator/NewsManage";
import CommentReport from "@/pages/contentmoderator/CommentReport";
import ContentModeratorDashboard from "../pages/contentmoderator/ModDashboard";


const ContentModeratorRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
        //   <ProtectedRoute allowedRoles={["Moderator"]}> --> Tạm thời đóng ProtectedRoute để test
            <ModeratorLayout />
        //   </ProtectedRoute>
        }
      >
        <Route index element={<ContentModeratorDashboard />} />
        <Route path="news" element={<NewsManage />} />
        <Route path="tickets" element={<TicketManage />} />
        <Route path="cmt" element={<CommentReport />} />
        // Routes chức năng khác
      </Route>
    </Routes>
  );
};

export default ContentModeratorRoutes;
