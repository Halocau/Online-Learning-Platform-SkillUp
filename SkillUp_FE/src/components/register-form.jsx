import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance, API_ENDPOINTS } from '@/config/api'
import { saveUserFromToken } from '@/lib/auth-utils'
import { toast } from 'react-toastify'

export function RegisterForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('student') // 'student' hoặc 'lecturer'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rePassword: '',
    fullname: ''
  })
  const [errorMsg, setErrorMsg] = useState('')

  // Đăng ký bằng Google
  const handleGoogleRegister = async (credentialResponse) => {
    try {
      setLoading(true)

      // Xác định roleId: Sinh viên = 5, Giảng viên = 4
      const defaultRoleId = activeTab === 'student' ? 5 : 4

      const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, {
        idToken: credentialResponse.credential,
        defaultRoleId: defaultRoleId
      })

      if (response.data.code === 200) {
        const userData = response.data.data[0]

        // Lưu token và thông tin người dùng
        saveUserFromToken(
          userData.token.accessToken,
          userData.token.refreshToken
        )

        // Thông báo thành công
        toast.success('Đăng ký thành công! Chào mừng bạn đến với SkillUp!')

        // Điều hướng về trang chủ
        setTimeout(() => {
          navigate('/home', { replace: true })
        }, 1000)
      }
    } catch (error) {
      console.error('Register failed:', error)
      if (error.response?.data?.message) {
        setErrorMsg('Đăng ký thất bại: ' + error.response.data.message)
      } else {
        setErrorMsg('Đăng ký thất bại. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

  // Đăng ký thông thường
  const handleNormalRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Kiểm tra hợp lệ
    if (!formData.email || !formData.password || !formData.rePassword || !formData.fullname) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password !== formData.rePassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp')
      return
    }

    if (formData.password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      // Xác định roleId: Sinh viên = 5, Giảng viên = 4
      const roleId = activeTab === 'student' ? 5 : 4

      const requestData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.rePassword,
        fullname: formData.fullname,
        roleId: roleId
      }

      console.log('📤 Dữ liệu gửi lên:', requestData)

      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, requestData)

      if (response.data.code === 200) {
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setErrorMsg(response.data.message || 'Đăng ký thất bại')
      }
    } catch (error) {
      console.error('Register failed:', error)
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message)
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0]
        setErrorMsg(firstError)
      } else {
        setErrorMsg('Đăng ký thất bại. Vui lòng thử lại!')
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

      {/* Tiêu đề */}
      <h2 className="text-3xl font-bold mb-6">Đăng ký</h2>

      {/* Chuyển tab: Sinh viên / Giảng viên */}
      <div className="flex mb-6 bg-gray-100 rounded-full p-1">
        <button
          type="button"
          onClick={() => setActiveTab('student')}
          className={cn(
            "flex-1 py-2 px-4 rounded-full font-medium transition-colors text-sm",
            activeTab === 'student'
              ? "bg-yellow-400 text-white shadow-md"
              : "bg-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Sinh viên
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lecturer')}
          className={cn(
            "flex-1 py-2 px-4 rounded-full font-medium transition-colors text-sm",
            activeTab === 'lecturer'
              ? "bg-yellow-400 text-white shadow-md"
              : "bg-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Giảng viên
        </button>
      </div>

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleNormalRegister} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <Input
              id="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-12"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 h-12"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Nhập lại mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="rePassword" className="text-sm font-medium">Nhập lại mật khẩu</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <Input
              id="rePassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={formData.rePassword}
              onChange={(e) => setFormData({ ...formData, rePassword: e.target.value })}
              className="pl-10 h-12"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Họ và tên */}
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-sm font-medium">Họ và tên</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <Input
              id="fullname"
              type="text"
              placeholder="Nhập họ và tên"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              className="pl-10 h-12"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Nút đăng ký */}
        <Button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white h-12 text-base font-semibold"
          disabled={loading}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>

        {/* Phân cách */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc tiếp tục với</span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => {
              setErrorMsg('Đăng ký với Google thất bại')
            }}
            type="standard"
            theme="outline"
            size="large"
            text="signup_with"  // Google mặc định chuỗi này; UI của Google có thể tự nội địa hoá theo locale trình duyệt
            shape="circle"
            width="100%"
          />
        </div>

        {/* Link đăng nhập */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-yellow-500 hover:text-yellow-600 font-medium">
              Đăng nhập
            </Link>
          </span>
        </div>
      </form>
    </div>
  )
}
