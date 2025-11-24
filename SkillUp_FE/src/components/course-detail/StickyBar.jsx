// src/components/course-detail/MobileStickyBar.jsx
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentAPI } from "@/api/paymentAPI";
import { useState } from "react";

export default function MobileStickyBar({ course, isEnrolled, checkingEnrollment }) {
  const { addToCart, loading } = useCart();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const showLearnNow = isEnrolled && !checkingEnrollment;

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

      if (result.success) {
        if (result.isFreeCourse) {
          toast.success(result.message || "Đăng ký khóa học miễn phí thành công!");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          toast.error(result.message || "Không thể tạo thanh toán");
        }
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

  const handleLearnNow = () => {
    navigate(`/student/learn/${course.id}`);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#fffffe]/95 backdrop-blur-sm border-t border-[#272343]/15 p-4 z-50 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-[#272343]">
            {course.title}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span>{course.rating.toFixed(1)} · {course.enrollmentCount} đánh giá</span>
            <span className="h-3 w-px bg-[#e5e7eb]"></span>
            <span className="font-semibold text-[#272343]">
              {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
            </span>
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={loading || paymentLoading || showLearnNow}
          variant="outline"
          className="rounded-full border-[#272343]/15 bg-[#fffffe] px-3 py-1.5 hover:bg-[#e3f6f5] flex-shrink-0"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
        <Button
          onClick={showLearnNow ? handleLearnNow : handleBuyNow}
          disabled={!showLearnNow && (loading || paymentLoading)}
          className="inline-flex items-center gap-2 rounded-full bg-[#FFD54F] hover:bg-[#ffca28] text-[#272343] font-semibold tracking-tight px-4 py-1.5 text-xs shadow-sm flex-shrink-0"
        >
          {showLearnNow ? "Học ngay" : paymentLoading ? "..." : "Đăng ký ngay"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}