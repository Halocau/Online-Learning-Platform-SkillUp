import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";

function PasswordChangeForm({
  passwordData,
  setPasswordData,
  onSubmit,
  loading,
}) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-2xl font-bold">Đổi mật khẩu</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Mật khẩu cũ
            </Label>
            <div className="relative">
              <Input
                name="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu cũ của bạn"
                required
                className="border-gray-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                required
                className="border-gray-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                name="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmNewPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="border-gray-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PasswordChangeForm;
