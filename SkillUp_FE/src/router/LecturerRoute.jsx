import { Routes, Route, Navigate } from "react-router-dom";
import LecturerLayout from "@/layouts/LecturerLayout";
import ApplyCV from "@/pages/Lecturer/ApplyCV";
import LecturerDashboard from "@/pages/Lecturer/LecturerDashboard";
import MyApplications from "@/pages/Lecturer/MyApplications";
import ManageCourses from "@/pages/Lecturer/ManageCourses";
import ManageQuestionBank from "@/pages/Lecturer/ManageQuestionBank";

/**
 * LecturerRoutes - Fixed routes without redirect loop
 * Key fix: Removed nested redirects that cause /dashboard/dashboard/dashboard issue
 */
function LecturerRoutes() {
  return (
    <Routes>
      <Route element={<LecturerLayout />}>
        <Route path="dashboard" element={<LecturerDashboard />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="apply-cv" element={<ApplyCV />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="question-bank" element={<ManageQuestionBank />} />
      </Route>
    </Routes>
  );
}

export default LecturerRoutes;
