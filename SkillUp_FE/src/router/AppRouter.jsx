// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import ResendVerification from "../pages/Auth/ResendVerification";
import Home from "../pages/Home/Home";
import MainLayout from "../layouts/MainLayout";

// Import role-based routes
import AdminRoutes from "./AdminRoutes";
import ContentModeratorRoutes from "./ContentModeratorRoutes";
import SystemModeratorRoutes from "./SystemModeratorRoutes";
import StudentRoutes from "./StudentRoutes";
import ForumRoutes from "./ForumRoute";
import NewsList from "@/pages/News/NewsList";
import NewsDetail from "@/pages/News/NewsDetail";

function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-result" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/forum/*" element={<ForumRoutes />} />
          
          <Route path="/news" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/contentmod/*" element={<ContentModeratorRoutes />} />
        <Route path="/sysmod/*" element={<SystemModeratorRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} />

        


      </Routes>
    </>
  );
}

export default AppRouter;
