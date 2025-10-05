import { Navigate } from 'react-router-dom';

// Component để bảo vệ các route cần đăng nhập
function PrivateRoute({ children }) {
  // TODO: Thay thế logic này bằng check authentication thật
  // Ví dụ: kiểm tra token trong localStorage hoặc context
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;