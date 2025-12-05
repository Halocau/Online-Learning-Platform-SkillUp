import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { getRedirectPath } from '@/lib/auth-utils';

function Unauthorized() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const redirectPath = getRedirectPath(userRole);
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-6">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Truy cập bị từ chối
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-2">
            Bạn không có quyền truy cập vào trang này. 
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi. 
          </p>

          {/* Role Info */}
          {userRole && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Vai trò hiện tại của bạn: <span className="font-semibold text-gray-900">{userRole}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;