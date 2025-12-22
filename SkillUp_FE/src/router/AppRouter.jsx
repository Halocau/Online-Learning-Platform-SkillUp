// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import VerifyEmail from "../pages/Auth/VerifyEmail.jsx";
import ResendVerification from "../pages/Auth/ResendVerification.jsx";
import ForgotPassword from "../pages/Auth/ForgotPassword.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";
import Home from "../pages/Home/Home.jsx";
import MyProfile from "../pages/Profile/MyProfile.jsx";
import MainLayout from "../layouts/MainLayout.jsx";

import AdminRoutes from "./AdminRoutes.jsx";
import ContentModeratorRoutes from "./ContentModeratorRoutes.jsx";
import SystemModeratorRoutes from "./SystemModeratorRoutes.jsx";
import StudentRoutes from "./StudentRoutes.jsx";
import LecturerRoutes from "./LecturerRoute.jsx";
import ForumRoutes from "./ForumRoute.jsx";

import TicketList from "@/pages/ticket/TicketList.jsx";
import TicketDetail from "@/pages/ticket/TicketDetail.jsx";
import NewsList from "@/pages/News/NewsList.jsx";
import NewsDetail from "@/pages/News/NewsDetail.jsx";
import MyCart from "@/pages/Cart/MyCart.jsx";
import CourseDetail from "@/pages/Course/CourseDetail.jsx";
import CoursesByCategory from "@/pages/Course/CoursesByCategory.jsx";
import MyCourses from "@/pages/Student/MyCourses.jsx";
import PaymentResult from "@/pages/Payment/PaymentResult.jsx";
import LecturerProfile from "@/pages/Lecturer/LecturerProfile.jsx";
import LecturerPendingGuard from "./LecturerPendingGuard.jsx";
import PurchaseHistory from "@/pages/Student/PurchaseHistory.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Unauthorized from "@/pages/Auth/Unauthorized.jsx";

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
              
                <MyCart />
             
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
