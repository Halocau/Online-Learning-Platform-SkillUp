import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy status và message từ URL params
  const status = searchParams.get('status') || 'verifying';
  const message = searchParams.get('message') || '';

  useEffect(() => {
    // Nếu verify thành công, redirect về login sau 3 giây
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-yellow-500">SkillUp</h1>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4">
            {status === 'verifying' && 'Đang xác thực email...'}
            {status === 'success' && 'Xác thực thành công!'}
            {status === 'error' && 'Xác thực thất bại'}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 mb-6">
            {status === 'success' && (message || 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.')}
            {status === 'error' && (message || 'Link xác thực không hợp lệ hoặc đã hết hạn.')}
            {status === 'verifying' && 'Đang chuyển hướng...'}
          </p>

          {/* Actions */}
          {status === 'success' && (
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Đi đến trang đăng nhập
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/resend-verification')}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Gửi lại email xác thực
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Đăng ký lại
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Quay về đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
