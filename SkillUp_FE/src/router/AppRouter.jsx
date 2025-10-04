import { Routes, Route } from 'react-router-dom';

// Import components
import Login from '../pages/Auth/Login';
import Home from '../pages/Home';
import Layout from '../components/Layout/Layout';

function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes - KHÔNG có header/footer */}
      <Route path="/login" element={<Login />} />
      
      {/* Public Routes - CÓ header/footer */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
      
      {/* Fallback - redirect về home */}
      <Route path="*" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;