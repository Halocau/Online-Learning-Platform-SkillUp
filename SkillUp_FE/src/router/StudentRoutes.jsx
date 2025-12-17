import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import StudentDashboard from "@/pages/Student/StudentDashboard.jsx";
import CourseLearning from "@/pages/Student/Learn/CourseLearning.jsx";
import QuizTakingPage from "@/pages/Student/Learn/components/Quiz/QuizTaking.jsx";

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
        <Route
          path="/learn/:courseId/complete"
          element={<CourseLearning />}
        />
        <Route path="quiz/:quizId/take" element={<QuizTakingPage />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
