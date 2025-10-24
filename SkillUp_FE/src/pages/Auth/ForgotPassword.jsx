import { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Send } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập email!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không đúng định dạng!');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axiosInstance.post('/Auth/forgot-password', {
        email: email
      });

      if (response.data.code === 200) {
        setEmailSent(true);
        toast.success('Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Email không tồn tại hoặc chưa được xác thực');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          {!emailSent ? (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
              <CardDescription>
                Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Email đã được gửi!</CardTitle>
              <CardDescription>
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi email khôi phục
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Các bước tiếp theo:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Kiểm tra hộp thư đến của bạn</li>
                  <li>Mở email từ SkillUp</li>
                  <li>Click vào link đặt lại mật khẩu</li>
                  <li>Nhập mật khẩu mới của bạn</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-yellow-600 hover:underline font-medium"
                >
                  thử lại
                </button>
              </p>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;
