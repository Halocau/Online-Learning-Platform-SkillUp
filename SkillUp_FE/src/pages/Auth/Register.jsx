import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import axios from 'axios'
import { getApiUrl, API_ENDPOINTS } from '@/config/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ fullname: '', email: '', password: '', confirmPassword: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()


  const roleIdMap = { student: 5, teacher: 4 }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) return setErrorMsg('Mật khẩu và xác nhận không khớp')

    const payload = {
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      fullname: form.fullname,
      roleId: roleIdMap[form.role] ?? 5,
    }

    try {
      setLoading(true)
      setErrorMsg('')
      const url = getApiUrl(API_ENDPOINTS.REGISTER || '/auth/register')
      const res = await axios.post(url, payload)

      if (res.data?.code === 200 || res.status === 200) {
        alert('Đăng ký thành công. Vui lòng đăng nhập.')
        return navigate('/login')
      }

      const message = res.data?.message || JSON.stringify(res.data) || 'Có lỗi xảy ra'
      setErrorMsg(message)
    } catch (err) {
      const msg = err.response
        ? `${err.response.status} - ${err.response.statusText}: ${JSON.stringify(err.response.data)}`
        : err.request
        ? 'Không nhận được phản hồi từ server. Vui lòng kiểm tra CORS hoặc server đang offline.'
        : err.message

      setErrorMsg(msg)
      alert('Đăng ký thất bại: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-blue-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Đăng ký</CardTitle>
            <CardDescription>
              Tạo tài khoản mới để bắt đầu học hoặc giảng dạy trên SkillUp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6')}>
              <div className="grid gap-2">
                <Label htmlFor="fullname">Họ và tên</Label>
                <Input id="fullname" value={form.fullname} onChange={(e) => setForm(prev => ({ ...prev, fullname: e.target.value }))} placeholder="Nguyễn Văn A" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="user@example.com" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
              </div>

              <div className="grid gap-2">
                <Label>Đăng ký với vai trò</Label>
                <div className="flex gap-4 items-center">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={() => setForm(prev => ({ ...prev, role: 'student' }))} />
                    <span>Học sinh</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="role" value="teacher" checked={form.role === 'teacher'} onChange={() => setForm(prev => ({ ...prev, role: 'teacher' }))} />
                    <span>Giảng viên</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
              {errorMsg && (
                <div className="text-sm text-destructive mt-2 break-words">{errorMsg}</div>
              )}

              <div className="text-center text-sm">
                Đã có tài khoản? <a href="/login" className="underline">Đăng nhập</a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
