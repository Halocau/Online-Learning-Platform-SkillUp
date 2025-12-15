import { cn } from "@/lib/utils.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance, API_ENDPOINTS } from '@/config/api'
import { toast } from 'react-toastify'

export function RegisterForm({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('student') // 'student' or 'lecturer'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rePassword: '',
    fullname: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const hasMinLength = formData.password.length >= 6
    const hasUppercase = /[A-Z]/.test(formData.password)
    const hasLowercase = /[a-z]/.test(formData.password)
    const hasNumber = /[0-9]/.test(formData.password)
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password)

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      newErrors.password = 'Mật khẩu phải ≥ 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    }

    if (!formData.rePassword) {
      newErrors.rePassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.rePassword) {
      newErrors.rePassword = 'Mật khẩu xác nhận chưa khớp'
    }

    const trimmedName = formData.fullname.trim()

    const letterCount = trimmedName.replace(/\s+/g, '').length

    if (!trimmedName) {
      newErrors.fullname = 'Vui lòng nhập họ và tên'
    } else if (letterCount < 4) {
      newErrors.fullname = 'Họ tên phải có tối thiểu 4 ký tự chữ'
    }

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle normal register
  const handleNormalRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const isValid = validateForm()
    if (!isValid) return

    setLoading(true)

    try {
      // Xác định roleId: Student = 5, Lecturer = 4
      const roleId = activeTab === 'student' ? 5 : 4

      const requestData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.rePassword,
        fullname: formData.fullname,
        roleId: roleId
      }

      console.log('📤 Request data:', requestData)

      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, requestData)

      if (response.data.code === 200) {
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')

        // Navigate về login sau 2 giây
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
        // Nếu backend trả về validation errors
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

      {/* Register Title */}
      <h2 className="text-3xl font-bold mb-6">Đăng ký tài khoản</h2>

      {/* Tab Switcher: Student / Lecturer */}
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
          Học viên
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

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleNormalRegister} className="space-y-4">
        {/* Email Input */}
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
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setFieldErrors((prev) => ({ ...prev, email: '' }))
              }}
              className={cn(
                "pl-10 h-12",
                fieldErrors.email && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={loading}
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
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
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setFieldErrors((prev) => ({ ...prev, password: '' }))
              }}
              className={cn(
                "pl-10 h-12",
                fieldErrors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={loading}
              required
            />
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* Re-Password Input */}
        <div className="space-y-2">
          <Label htmlFor="rePassword" className="text-sm font-medium">Xác nhận mật khẩu</Label>
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
              onChange={(e) => {
                setFormData({ ...formData, rePassword: e.target.value })
                setFieldErrors((prev) => ({ ...prev, rePassword: '' }))
              }}
              className={cn(
                "pl-10 h-12",
                fieldErrors.rePassword && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={loading}
              required
            />
          </div>
          {fieldErrors.rePassword && (
            <p className="text-sm text-red-600">{fieldErrors.rePassword}</p>
          )}
        </div>

        {/* Full Name Input */}
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
              onChange={(e) => {
                setFormData({ ...formData, fullname: e.target.value })
                setFieldErrors((prev) => ({ ...prev, fullname: '' }))
              }}
              className={cn(
                "pl-10 h-12",
                fieldErrors.fullname && "border-red-500 focus-visible:ring-red-500"
              )}
              minLength={2}
              disabled={loading}
              required
            />
          </div>
          {fieldErrors.fullname && (
            <p className="text-sm text-red-600">{fieldErrors.fullname}</p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white h-12 text-base font-semibold"
          disabled={loading}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
        </Button>

        {/* Login Link */}
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
