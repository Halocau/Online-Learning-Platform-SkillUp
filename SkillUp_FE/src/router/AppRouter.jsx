// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import ResendVerification from "../pages/Auth/ResendVerification";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Home from "../pages/Home/Home";
import MyProfile from "../pages/Profile/MyProfile";
import ApplyCV from "../pages/Lecturer/ApplyCV";
import MyApplications from "../pages/Lecturer/MyApplications";
import MainLayout from "../layouts/MainLayout";

// Import role-based routes
import AdminRoutes from "./AdminRoutes";
import ContentModeratorRoutes from "./ContentModeratorRoutes";
import SystemModeratorRoutes from "./SystemModeratorRoutes";
import StudentRoutes from "./StudentRoutes";
import CreatePost from "@/pages/forum/ForumForm";
import TicketList from "@/pages/Ticket/TicketList";
import TicketDetail from "@/pages/Ticket/TicketDetail";
import ForumRoutes from "./ForumRoute";
import NewsList from "@/pages/News/NewsList";
import NewsDetail from "@/pages/News/NewsDetail";
import LecturerRoutes from "./LecturerRoute";
import MyCart from "@/pages/Cart/MyCart";
import CourseDetail from "@/pages/Course/CourseDetail";
import CoursesByCategory from "@/pages/Course/CoursesByCategory";
import PaymentResult from "@/pages/Payment/PaymentResult";
import LecturerPendingGuard from "./LecturerPendingGuard";

function AppRouter() {
  return (
    <LecturerPendingGuard>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-result" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/profile" element={<MyProfile />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/forum/*" element={<ForumRoutes />} />

          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/cart" element={<MyCart />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:categoryId" element={<CoursesByCategory />} />
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/contentmod/*" element={<ContentModeratorRoutes />} />
        <Route path="/sysmod/*" element={<SystemModeratorRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} />
        <Route path="lecturer/*"  element={<LecturerRoutes />}/>
        <Route path="/ticket" element={<TicketList />} />
        <Route path="/ticket/:ticketCode" element={<TicketDetail />} />

        <Route path="*" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </LecturerPendingGuard>
  );
}

export default AppRouter;
