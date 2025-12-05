// src/routes/ContentModeratorRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ModeratorLayout from "../layouts/ContentModeratorLayout";
import ProtectedRoute from "./ProtectedRoute";

import ContentModeratorDashboard from "../pages/contentmoderator/ContentModDashboard";
import NewsManage from "@/pages/contentmoderator/NewsFeature/NewsManage";
import CommentReport from "@/pages/contentmoderator/CommentReport";
import CreateNews from "@/pages/contentmoderator/NewsFeature/CreateNews";
import EditNews from "@/pages/contentmoderator/NewsFeature/EditNews";
import NewsDetailMod from "@/pages/contentmoderator/NewsFeature/DetailNewsMod";
import CourseManage from "@/pages/contentmoderator/CourseManage/CourseManage";
import CategoryManage from "@/pages/contentmoderator/CategoryManage";
import ForumManage from "@/pages/contentmoderator/ForumManage";
import BannerManage from "@/pages/contentmoderator/BannerManage";
import ModProfile from "@/pages/Profile/ModProfile";

const ContentModeratorRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["Content Morderator"]}>
            <ModeratorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ContentModeratorDashboard />} />
        <Route path="dashboard" element={<ContentModeratorDashboard />} />
        <Route path="news" element={<NewsManage />} />
        <Route path="createnews" element={<CreateNews />} />
        <Route path="detailnews/:id" element={<NewsDetailMod />} />
        <Route path="editnews/:id" element={<EditNews />} />
        <Route path="course" element={<CourseManage />} />
        <Route path="rpcmt" element={<CommentReport />} />
        <Route path="category" element={<CategoryManage />} />
        <Route path="forum" element={<ForumManage />} />
        <Route path="banner" element={<BannerManage />} />
        <Route path="profile" element={<ModProfile />} />

      </Route>
    </Routes>
  );
};

export default ContentModeratorRoutes;
