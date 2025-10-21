import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance, API_ENDPOINTS } from '@/config/api'
import { saveUserFromToken, getRedirectPath } from '@/lib/auth-utils'
import { toast } from 'react-toastify'

export function LoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Handle Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)

      // Gửi ID Token lên backend
      const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, {
        idToken: credentialResponse.credential,
        defaultRoleId: 5  
      })

      if (response.data.code === 200) {
        const userData = response.data.data[0]

        // Lưu token và user info (bao gồm role từ JWT)
        saveUserFromToken(
          userData.token.accessToken,
          userData.token.refreshToken
        )

        // Thông báo thành công
        if (userData.isNewUser) {
          toast.success('Đăng ký thành công! Chào mừng bạn đến với SkillUp!')
        } else {
          toast.success('Đăng nhập Google thành công!')
        }

        // Lấy user info từ localStorage để navigate
        const user = JSON.parse(localStorage.getItem('user'))
        const redirectPath = getRedirectPath(user.role)

        // Navigate theo role sau 1 giây
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 1000)
      }
    } catch (error) {
      console.error('Login failed:', error)       
        if (error.response?.data?.message) {
          setErrorMsg('Đăng nhập thất bại: ' + error.response.data.message)
        } else {
          setErrorMsg('Đăng nhập thất bại. Vui lòng thử lại!')
        }
    } finally {
      setLoading(false)
    }
  }

  // Handle normal login
  const handleNormalLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password
      })

      if (response.data.code === 200) {
        const { accessToken, refreshToken } = response.data.data[0]

        // Lưu token và user info (bao gồm role từ JWT)
        saveUserFromToken(accessToken, refreshToken)

        // Thông báo thành công
        toast.success('Đăng nhập thành công!')

        // Lấy user info từ localStorage để navigate
        const user = JSON.parse(localStorage.getItem('user'))
        const redirectPath = getRedirectPath(user.role)

        // Navigate theo role sau 1 giây
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 1000)
      } else {
        setErrorMsg(response.data.message || 'Đăng nhập thất bại')
      }
    } catch (error) {
      console.error('Login failed:', error)
      
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message)
      } else {
        setErrorMsg('Đăng nhập thất bại. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

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
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <Input 
              id="email" 
              type="email" 
              placeholder="Nhập địa chỉ email" 
              className="pl-10"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required 
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <Input 
              id="password" 
              type="password" 
              placeholder="Nhập mật khẩu"
              className="pl-10"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required 
            />
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
          <a href="#" className="text-sm text-red-500 hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        {/* Login Button */}
        <Button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-12"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

     
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">hoặc tiếp tục với</span>
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
              onError={() => {
                setErrorMsg('Đăng nhập Google thất bại. Vui lòng thử lại.')
              }}
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
          <Link to="/register" className="text-purple-600 font-semibold hover:underline">
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
