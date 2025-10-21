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
import CreatePost from "@/pages/forum/CreatePost";

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
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/contentmod/*" element={<ContentModeratorRoutes />} />
        <Route path="/sysmod/*" element={<SystemModeratorRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} />

        <Route path="*" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/forum" element={<CreatePost/>} />
      </Routes>
    </>
  );
}

export default AppRouter;
