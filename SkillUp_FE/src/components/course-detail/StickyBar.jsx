// src/components/course-detail/MobileStickyBar.jsx
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentAPI } from "@/api/paymentAPI";
import { useState } from "react";

export default function MobileStickyBar({ course }) {
  const { addToCart, loading } = useCart();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    const result = await addToCart(course.id, course.price);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyNow = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.info("Vui lòng đăng nhập để mua khóa học");
      navigate("/login");
      return;
    }

    try {
      setPaymentLoading(true);
      const result = await paymentAPI.createCoursePayment(course.id);
      
      if (result.success && result.checkoutUrl) {
        // Chuyển sang trang PayOS
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.message || "Không thể tạo thanh toán");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-[#FFD54F]/30 p-4 z-50 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {course.price === 0 ? (
            <p className="text-2xl font-bold text-green-600">Miễn phí</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {course.price.toLocaleString()} ₫
              </p>
              <p className="text-xs text-gray-500 line-through">
                {(course.price * 1.5).toLocaleString()} ₫
              </p>
            </>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={loading || paymentLoading}
          variant="outline"
          className="border-2 border-[#FFD54F] text-gray-900 hover:bg-[#FFD54F]/10 px-4"
        >
          <ShoppingCart className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={loading || paymentLoading}
          className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold px-6"
        >
          <Zap className="w-4 h-4 mr-1" />
          {paymentLoading ? "..." : "Mua ngay"}
        </Button>
      </div>
    </div>
  );
}