// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import ResendVerification from "../pages/Auth/ResendVerification";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Home from "../pages/Home/Home";
import MyProfile from "../pages/Profile/MyProfile";
import MainLayout from "../layouts/MainLayout";

import AdminRoutes from "./AdminRoutes";
import ContentModeratorRoutes from "./ContentModeratorRoutes";
import SystemModeratorRoutes from "./SystemModeratorRoutes";
import StudentRoutes from "./StudentRoutes";
import LecturerRoutes from "./LecturerRoute";
import ForumRoutes from "./ForumRoute";

import TicketList from "@/pages/Ticket/TicketList";
import TicketDetail from "@/pages/Ticket/TicketDetail";
import NewsList from "@/pages/News/NewsList";
import NewsDetail from "@/pages/News/NewsDetail";
import MyCart from "@/pages/Cart/MyCart";
import CourseDetail from "@/pages/Course/CourseDetail";
import CoursesByCategory from "@/pages/Course/CoursesByCategory";
import MyCourses from "@/pages/Student/MyCourses";
import PaymentResult from "@/pages/Payment/PaymentResult";
import LecturerProfile from "@/pages/Lecturer/LecturerProfile";
import LecturerPendingGuard from "./LecturerPendingGuard";
import PurchaseHistory from "@/pages/Student/PurchaseHistory";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "@/pages/Auth/Unauthorized";

function AppRouter() {
  return (
    <LecturerPendingGuard>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-result" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "Content Morderator",
                "System Morderator",
                "Lecturer",
                "Student",
              ]}
            >
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="forum/*" element={<ForumRoutes />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          <Route path="courses/:categoryId" element={<CoursesByCategory />} />
          <Route
            path="lecturer-info/:accountId"
            element={<LecturerProfile />}
          />

          {/* Student-only routes (protected individually) */}
          <Route
            path="cart"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <MyCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchase-history"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <PurchaseHistory />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Tickets - protected (Students & Lecturers) */}
        <Route
          path="/ticket"
          element={
            <ProtectedRoute allowedRoles={["Student", "Lecturer"]}>
              <TicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:ticketCode"
          element={
            <ProtectedRoute allowedRoles={["Student", "Lecturer"]}>
              <TicketDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/contentmod/*" element={<ContentModeratorRoutes />} />
        <Route path="/sysmod/*" element={<SystemModeratorRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} />
        <Route path="/lecturer/*" element={<LecturerRoutes />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LecturerPendingGuard>
  );
}

export default AppRouter;
