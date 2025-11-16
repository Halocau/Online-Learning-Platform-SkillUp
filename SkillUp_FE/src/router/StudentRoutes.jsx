import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "@/pages/Student/StudentDashboard";
import CourseLearning from "@/pages/Student/Learn/CourseLearning";

const StudentRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        {/* Updated: Now includes sectionId */}
        <Route path="learn/:courseId/:sectionId" element={<CourseLearning />} />
        <Route path="learn/:courseId" element={<CourseLearning />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;