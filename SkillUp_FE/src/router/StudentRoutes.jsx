import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "../pages/student/StudentDashboard";

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
        {/* <Route path="courses" element={<MyCourses />} /> */}
        {/* <Route path="profile" element={<MyProfile />} /> */}
        {/* <Route path="progress" element={<MyProgress />} /> */}
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
