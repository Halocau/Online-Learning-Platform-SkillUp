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

        <Route path="learn/:courseId" element={<CourseLearning />} />
        <Route
          path="learn/:courseId/section/:sectionId"
          element={<CourseLearning />}
        />

        <Route
          path="learn/:courseId/section/:sectionId/lesson/:lessonId"
          element={<CourseLearning />}
        />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
