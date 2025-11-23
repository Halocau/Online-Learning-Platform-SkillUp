import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "@/pages/Student/StudentDashboard";
import CourseLearning from "@/pages/Student/Learn/CourseLearning";
import QuizTakingPage from "@/pages/Student/Learn/components/Quiz/QuizTaking";


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

        {/* Course learning routes */}
        <Route path="learn/:courseId" element={<CourseLearning />} />
        <Route
          path="learn/:courseId/section/:sectionId"
          element={<CourseLearning />}
        />
        <Route
          path="learn/:courseId/section/:sectionId/lesson/:lessonId"
          element={<CourseLearning />}
        />

        <Route path="quiz/:quizId/take" element={<QuizTakingPage />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;