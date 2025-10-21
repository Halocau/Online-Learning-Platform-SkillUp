import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function VerifyEmailHandler() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      window.location.href = '/verify-email-result?status=error&message=Thiếu thông tin xác thực';
      return;
    }

    // Redirect trực tiếp đến backend, backend sẽ xử lý và redirect về frontend
    window.location.href = `http://localhost:5120/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang xác thực email...</p>
      </div>
    </div>
  );
}

export default VerifyEmailHandler;
