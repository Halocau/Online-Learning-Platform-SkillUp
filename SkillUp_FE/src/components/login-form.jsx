import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { saveUserFromToken, getRedirectPath } from "@/lib/auth-utils";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";

export function LoginForm({ className, ...props }) {
  const navigate = useNavigate();
  const { mergeGuestCartWithServer } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, {
        idToken: credentialResponse.credential,
        defaultRoleId: 5,
      });

      if (response.data.code === 200) {
        const userData = response.data.data[0];
        saveUserFromToken(
          userData.token.accessToken,
          userData.token.refreshToken
        );

        // Merge guest cart với server cart
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?.userId) {
          const mergeResult = await mergeGuestCartWithServer(user.userId);
          if (mergeResult?.success) {
            toast.success(mergeResult.message);
          }
        }

        if (userData.isNewUser) {
          toast.success("Đăng ký thành công! Chào mừng bạn đến với SkillUp!");
        } else {
          toast.success("Đăng nhập Google thành công!");
        }

        // Check if user came from cart page
        const previousPath = localStorage.getItem('redirectAfterLogin');

        if (previousPath && previousPath.includes('/cart')) {
          localStorage.removeItem('redirectAfterLogin');

          if (!user?.userId) {
            toast.error('Lỗi: Không tìm thấy thông tin người dùng');
            return;
          }

          setTimeout(() => {
            navigate(`/cart/${user.userId}`, { replace: true });
          }, 1500); // Tăng thời gian chờ
          return;
        }        // Check if Lecturer → Need async status check
        if (user.role === 'Lecturer') {
          const lecturerPath = await getLecturerRedirectPath(axiosInstance);
          setTimeout(() => {
            navigate(lecturerPath, { replace: true });
          }, 1000);
        } else {
          const redirectPath = getRedirectPath(user.role);
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMsg(
        error.response?.data?.message
          ? "Đăng nhập thất bại: " + error.response.data.message
          : "Đăng nhập thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle normal login
  const handleNormalLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.code === 200) {
        const { accessToken, refreshToken } = response.data.data[0];
        saveUserFromToken(accessToken, refreshToken);

        // Merge guest cart với server cart
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?.userId) {
          const mergeResult = await mergeGuestCartWithServer(user.userId);
          if (mergeResult?.success) {
            toast.success(mergeResult.message);
          }
        }

        toast.success("Đăng nhập thành công!");

        // Check if user came from cart page
        const previousPath = localStorage.getItem('redirectAfterLogin');

        if (previousPath && previousPath.includes('/cart')) {
          localStorage.removeItem('redirectAfterLogin');

          if (!user?.userId) {
            toast.error('Lỗi: Không tìm thấy thông tin người dùng');
            return;
          }

          setTimeout(() => {
            navigate(`/cart/${user.userId}`, { replace: true });
          }, 1500); // Tăng thời gian chờ để đảm bảo user đã lưu vào localStorage
          return;
        }        // Check if Lecturer → Need async status check
        if (user.role === 'Lecturer') {
          const lecturerPath = await getLecturerRedirectPath(axiosInstance);
          setTimeout(() => {
            navigate(lecturerPath, { replace: true });
          }, 1000);
        } else {
          const redirectPath = getRedirectPath(user.role);
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);
        }
      } else {
        setErrorMsg(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMsg(
        error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-500">SkillUp</h1>
      </div>

      {/* Login Title */}
      <h2 className="text-3xl font-bold mb-8">Đăng nhập</h2>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleNormalLogin} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <Input
              id="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              className="pl-10"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* Password Input with Eye Toggle */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </Label>
          <div className="relative">
            {/* Lock icon */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>

            {/* Password input */}
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7
                  1.07-2.37 3.05-4.36 5.5-5.54"
                  />
                  <path d="M1 1l22 22" />
                  <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
                  <path d="M12 5c5 0 9.27 3 11 7a10.94 10.94 0 0 1-2.06 3.06" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-sm">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-red-500 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-12"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">
              hoặc tiếp tục với
            </span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() =>
                setErrorMsg("Đăng nhập Google thất bại. Vui lòng thử lại.")
              }
              text="continue_with"
              shape="circle"
              size="large"
              width="350"
            />
          )}
        </div>

        {/* Register Link */}
        <div className="text-center text-sm mt-6">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-purple-600 font-semibold hover:underline"
          >
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
