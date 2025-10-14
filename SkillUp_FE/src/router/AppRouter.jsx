// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Home from "../pages/Home/Home";
import MainLayout from "../layouts/MainLayout";

// Import role-based routes
import AdminRoutes from "./AdminRoutes";
import ContentModeratorRoutes from "./ContentModeratorRoutes";
import SystemModeratorRoutes from "./SystemModeratorRoutes";

function AppRouter() {
  return (
    <>
      <Routes>
        
        <Route path="/login" element={<Login />} />

        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/contentmod/*" element={<ContentModeratorRoutes />} />
        <Route path="/sysmod/*" element={<SystemModeratorRoutes />} />

        
        <Route path="*" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppRouter;
