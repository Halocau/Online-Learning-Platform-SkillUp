// src/pages/Payment/PaymentResult.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { paymentAPI } from "@/api/paymentAPI";
import { toast } from "react-toastify";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, failed
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  useEffect(() => {
    const verifyPayment = async () => {
      const orderCode = searchParams.get("orderCode");
      const statusParam = searchParams.get("status");

      if (!orderCode) {
        setStatus("failed");
        setMessage("Không tìm thấy mã đơn hàng");
        return;
      }

      // Kiểm tra nếu user hủy thanh toán (PayOS trả về status=CANCELLED hoặc cancel=true)
      const cancelParam = searchParams.get("cancel");
      if (statusParam === "cancel" || statusParam === "CANCELLED" || cancelParam === "true") {
        setStatus("failed");
        setMessage("Bạn đã hủy thanh toán");
        
        // Gọi API để update transaction status thành Failed
        try {
          await paymentAPI.cancelCoursePayment(orderCode);
        } catch (error) {
          console.error("Error cancelling payment:", error);
        }
        
        return;
      }

      try {
        // Gọi API verify payment và tự động enrollment
        const success = await paymentAPI.verifyCoursePayment(orderCode);
        
        if (success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Bạn đã được đăng ký khóa học.");
          toast.success("Đăng ký khóa học thành công!");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại hoặc đã xử lý trước đó");
        }
      } catch (error) {
        console.error("Verify payment error:", error);
        setStatus("failed");
        setMessage(error.message || "Có lỗi xảy ra khi xác thực thanh toán");
        toast.error("Xác thực thanh toán thất bại");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToCourses = () => {
    navigate("/my-courses");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              {status === "processing" && (
                <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle className="w-20 h-20 text-green-500" />
              )}
              {status === "failed" && (
                <XCircle className="w-20 h-20 text-red-500" />
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {status === "processing" && "Đang xử lý"}
                {status === "success" && "Thành công!"}
                {status === "failed" && "Thất bại!"}
              </h1>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Actions */}
            {status !== "processing" && (
              <div className="space-y-3 pt-4">
                {status === "success" && (
                  <Button
                    onClick={handleGoToCourses}
                    className="w-full bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold py-6"
                  >
                    Xem khóa học của tôi
                  </Button>
                )}
                <Button
                  onClick={handleGoToHome}
                  variant="outline"
                  className="w-full border-2 border-gray-300 py-6"
                >
                  Về trang chủ
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
