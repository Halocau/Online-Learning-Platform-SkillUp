// src/routes/LecturerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import LecturerLayout from "@/layouts/LecturerLayout";
import ProtectedRoute from "./ProtectedRoute";
import ApplyCV from "@/pages/Lecturer/ApplyCV";
import LecturerDashboard from "@/pages/Lecturer/LecturerDashboard";
import MyApplications from "@/pages/Lecturer/MyApplications";
import ManageCourses from "@/pages/Lecturer/ManageCourses";
import ManageQuestionBank from "@/pages/Lecturer/ManageQuestionBank";
import CourseDetailManagement from "@/pages/Lecturer/CourseDetailManagement";
import LecturerTicketList from "@/pages/Lecturer/LecturerTicketList";
import LecturerTicketDetail from "@/pages/Lecturer/LecturerTicketDetail";
import CoursePreview from "@/pages/Lecturer/CoursePreview";

function LecturerRoutes() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["Lecturer"]}>
            <LecturerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LecturerDashboard />} />
        <Route path="dashboard" element={<LecturerDashboard />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="courses/:courseId" element={<CourseDetailManagement />} />
        <Route path="courses/:courseId/preview" element={<CoursePreview />} />
        <Route path="apply-cv" element={<ApplyCV />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="question-bank" element={<ManageQuestionBank />} />
        <Route path="courses/:courseId" element={<CourseDetailManagement />} />
        <Route path="ticket" element={<LecturerTicketList />} />
        <Route path="ticket/:ticketCode" element={<LecturerTicketDetail />} />
      </Route>
    </Routes>
  );
}

export default LecturerRoutes;
