// src/components/course-detail/CourseEnrollmentCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CourseEnrollmentCard({ course }) {
  const { addToCart, loading } = useCart();
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

    // Add to cart first, then navigate to cart
    const result = await addToCart(course.id, course.price);
    if (result.success) {
      navigate(`/cart/${user.id}`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card className="sticky top-4 overflow-hidden border-2 border-[#FFD54F]/20 shadow-xl">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-[#FFD54F] text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          {course.price === 0
            ? "MIỄN PHÍ"
            : `${(course.price / 1000).toFixed(0)}K ₫`}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Price */}
        <div className="space-y-2">
          {course.price === 0 ? (
            <div>
              <p className="text-4xl font-bold text-green-600">Miễn phí</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {course.price.toLocaleString()} ₫
              </p>
              <p className="text-sm text-gray-500 line-through">
                {(course.price * 1.5).toLocaleString()} ₫
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleBuyNow}
            disabled={loading}
            className="w-full bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Mua ngay
          </Button>

          <Button
            onClick={handleAddToCart}
            disabled={loading}
            variant="outline"
            className="w-full border-2 border-[#FFD54F] text-gray-900 hover:bg-[#FFD54F]/10 font-semibold py-6 text-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
