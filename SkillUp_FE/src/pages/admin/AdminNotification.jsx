import { useState } from "react";
import { adminAPI } from "@/api/adminAPI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription ,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import { Bell, AlertCircle, Loader2, Send, RotateCcw } from "lucide-react";

const AdminNotification = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    contents: "",
  });
  const [charCount, setCharCount] = useState({ title: 0, contents: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCharCount((prev) => ({
      ...prev,
      [name]: value.length,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.contents.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.");
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.notifyAllUsers(formData);

      toast.success(
        response.data?.contents ||
          "Hệ thống đang gửi thông báo trong nền. Vui lòng đợi trong giây lát."
      );

      // Reset form
      setFormData({
        title: "",
        contents: "",
      });
      setCharCount({ title: 0, contents: 0 });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Gửi thông báo thất bại. Vui lòng kiểm tra lại.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ title: "", contents: "" });
    setCharCount({ title: 0, contents: 0 });
  };

  const isFormValid = formData.title.trim() && formData.contents.trim();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          Gửi Thông Báo Hệ Thống
        </h1>
        <p className="text-muted-foreground mt-2">
          Gửi thông báo quan trọng đến tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Nội dung thông báo</CardTitle>
          <CardDescription>
            Điền thông tin thông báo bên dưới. Hệ thống sẽ xử lý gửi trong nền.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="VD: Bảo trì hệ thống vào 20:00 ngày 15/12"
                value={formData.title}
                onChange={handleInputChange}
                disabled={loading}
                maxLength={100}
                className="text-base"
              />
              <p className="text-sm text-muted-foreground text-right">
                {charCount.title}/100 ký tự
              </p>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <Label htmlFor="contents" className="text-base font-semibold">
                Nội dung thông báo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="contents"
                name="contents"
                placeholder="Nhập nội dung chi tiết thông báo..."
                value={formData.contents}
                onChange={handleInputChange}
                disabled={loading}
                rows={8}
                maxLength={1000}
                className="text-base resize-none"
              />
              <p className="text-sm text-muted-foreground text-right">
                {charCount.contents}/1000 ký tự
              </p>
            </div>
          </CardContent>

          {/* Footer with Actions */}
          <CardFooter className="flex justify-between gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading || (!formData.title && !formData.contents)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </Button>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="min-w-[140px] gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi thông báo
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminNotification;
