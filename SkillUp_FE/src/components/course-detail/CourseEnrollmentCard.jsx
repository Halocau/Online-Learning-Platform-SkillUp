// src/components/course-detail/CourseEnrollmentCard.jsx
import { ShoppingCart, Play, Percent, Coins, Bot } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentAPI } from "@/api/paymentAPI";
import { useState } from "react";

export default function CourseEnrollmentCard({ course, isEnrolled, checkingEnrollment }) {
  const { addToCart, loading } = useCart();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  const handleLearnNow = () => {
    navigate(`/student/learn/${course.id}`);
  };

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

  
  const showLearnNow = isEnrolled && !checkingEnrollment;

  return (
    <div className="sticky top-24 w-full lg:max-w-sm z-10">
      <div className="rounded-2xl border border-[#272343]/15 bg-[#fffffe]/90 shadow-sm backdrop-blur overflow-hidden">
        {/* Video preview placeholder */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-tr from-[#FFD54F] via-[#ffecb3] to-[#e3f6f5]">
          <div className="aspect-video flex items-center justify-center">
            {course.image ? (
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <button className="inline-flex items-center justify-center rounded-full bg-[#272343]/90 px-4 py-2 text-xs font-semibold tracking-tight text-[#fffffe] hover:bg-[#272343] transition-colors">
                <Play className="mr-2 h-4 w-4 text-[#FFD54F]" />
                Xem video giới thiệu
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Price Section */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-end gap-2">
              <div className="text-xl font-semibold tracking-tight text-[#272343]">
                {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
              </div>
            </div>
          </div>

          {course.isAiSupport && (
            <div className="flex items-center gap-2 text-sm text-[#272343] bg-blue-50 p-2 rounded-md">
              <Bot className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Hỗ trợ AI: Phụ đề tự động & Chatbot hỗ trợ học tập</span>
            </div>
          )}

          <button
            onClick={showLearnNow ? handleLearnNow : handleBuyNow}
            disabled={!showLearnNow && (loading || paymentLoading)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFD54F] px-4 py-2.5 text-sm font-semibold tracking-tight text-[#272343] shadow-sm hover:bg-[#ffca28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showLearnNow
              ? "Học ngay"
              : paymentLoading
                ? "Đang xử lý..."
                : course.price === 0
                  ? "Đăng ký miễn phí"
                  : "Mua ngay"}
            {showLearnNow ? (
              <Play className="h-4 w-4 text-[#272343]" />
            ) : (
              <Coins className="h-4 w-4 text-[#272343]" />
            )}
          </button>


          <button
            onClick={handleAddToCart}
            disabled={loading || paymentLoading || showLearnNow}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#272343]/15 bg-[#fffffe] px-4 py-2 text-xs font-medium tracking-tight text-[#272343] hover:bg-[#FFF8E1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showLearnNow ? "Bạn đã sở hữu khóa học" : "Thêm vào giỏ hàng"}
            <ShoppingCart className="h-4 w-4 text-[#272343]" />
          </button>
        </div>
      </div>
    </div>
  );
}