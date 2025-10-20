// src/router/StudentRoutes.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";



const StudentRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["Student", "Teacher"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>My Dashboard</div>} />
        {/* <Route path="courses" element={<MyCourses />} /> */}
        {/* <Route path="profile" element={<MyProfile />} /> */}
        {/* <Route path="progress" element={<MyProgress />} /> */}
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
