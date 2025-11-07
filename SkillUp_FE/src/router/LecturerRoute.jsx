// src/routes/LecturerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import LecturerLayout from "@/layouts/LecturerLayout";
import ProtectedRoute from "./ProtectedRoute";
import ApplyCV from "@/pages/Lecturer/ApplyCV";
import LecturerDashboard from "@/pages/Lecturer/LecturerDashboard";
import MyApplications from "@/pages/Lecturer/MyApplications";
import ManageCourses from "@/pages/Lecturer/ManageCourses";
import CourseDetailManagement from "@/pages/Lecturer/CourseDetailManagement";

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
        <Route path="apply-cv" element={<ApplyCV />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="courses/:courseId" element={<CourseDetailManagement />} />
      </Route>
    </Routes>
  );
}

export default LecturerRoutes;