// src/routes/LecturerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import LecturerLayout from "@/layouts/LecturerLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ApplyCV from "@/pages/Lecturer/ApplyCV.jsx";
import LecturerDashboard from "@/pages/Lecturer/LecturerBoard/LecturerDashboard.jsx";
import MyApplications from "@/pages/Lecturer/MyApplications.jsx";
import ManageCourses from "@/pages/Lecturer/ManageCourses.jsx";
import ManageQuestionBank from "@/pages/Lecturer/ManageQuestionBank.jsx";
import LecturerTicketList from "@/pages/Lecturer/LecturerTicketList.jsx";
import LecturerTicketDetail from "@/pages/Lecturer/LecturerTicketDetail";
import CoursePreview from "@/pages/Lecturer/Course/CoursePreview";
import ManageStudents from "@/pages/Lecturer/LecturerBoard/ManageStudents";
import CourseDetailManagement from "@/pages/Lecturer/Course/DetailCourseTabs/CourseDetailManagement";
import LecturerProfile from "@/pages/Lecturer/components/Profile/LecturerProfile";


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
        <Route path="profile" element={<LecturerProfile />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="courses/:courseId" element={<CourseDetailManagement />} />
        <Route path="courses/:courseId/preview" element={<CoursePreview />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="apply-cv" element={<ApplyCV />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="question-bank" element={<ManageQuestionBank />} />
        <Route path="ticket" element={<LecturerTicketList />} />
        <Route path="ticket/:ticketCode" element={<LecturerTicketDetail />} />
      </Route>
    </Routes>
  );
}

export default LecturerRoutes;