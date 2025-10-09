import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import axios from 'axios'
import { getApiUrl, API_ENDPOINTS } from '@/config/api'

export function LoginForm({
  className,
  ...props
}) {
  const [loading, setLoading] = useState(false)

  // Handle Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      console.log('🔑 Google ID Token:', credentialResponse.credential)

      // Gửi ID Token lên backend
      const response = await axios.post(getApiUrl(API_ENDPOINTS.GOOGLE_LOGIN), {
        idToken: credentialResponse.credential,
        defaultRoleId: 1  // 1 = Student role
      })

      console.log('✅ Response:', response.data)

      if (response.data.code === 200) {
        const userData = response.data.data[0]

        // Lưu token và user info vào localStorage
        localStorage.setItem('accessToken', userData.token.accessToken)
        localStorage.setItem('refreshToken', userData.token.refreshToken)
        localStorage.setItem('user', JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          fullname: userData.fullname,
          avatar: userData.avatar
        }))

        // Thông báo
        if (userData.isNewUser) {
          alert('🎉 Đăng ký thành công! Chào mừng bạn đến với SkillUp!')
        } else {
          alert('✅ Đăng nhập thành công!')
        }

        // Chuyển hướng
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Login failed:', error)

      if (error.response?.data?.message) {
        alert('Đăng nhập thất bại: ' + error.response.data.message)
      } else {
        alert('Đăng nhập thất bại. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle normal login
  const handleNormalLogin = async (e) => {
    e.preventDefault()
    // TODO: Implement normal email/password login
    alert('Chức năng đăng nhập thường đang được phát triển')
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNormalLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@example.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>

              {/* Google Login với divider đẹp */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                {loading ? (
                  <Button variant="outline" className="w-full" disabled>
                    Đang đăng nhập...
                  </Button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      console.log('❌ Google Login Failed')
                      alert('Đăng nhập Google thất bại. Vui lòng thử lại!')
                    }}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="100%"
                  />
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
