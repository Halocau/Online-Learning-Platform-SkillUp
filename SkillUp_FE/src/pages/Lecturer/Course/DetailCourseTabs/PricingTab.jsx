import { useState, useEffect } from "react";
import { DollarSign, RefreshCw, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/config/api";
import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";

function PricingTab({ course, courseId, onUpdate }) {
  const [priceType, setPriceType] = useState("free");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);

  // Fetch fresh course data when component mounts or courseId changes
  useEffect(() => {
    if (courseId) {
      fetchCoursePrice();
    }
  }, [courseId]);

  // Update state when course prop changes
  useEffect(() => {
    if (course) {
      updatePriceState(course.price);
    }
  }, [course]);

  const fetchCoursePrice = async () => {
    try {
      setRefreshing(true);
      const response = await courseAPI.getCourseDetail(courseId);
      
      if (response.data.code === 200 && response.data.data.length > 0) {
        const courseData = response.data.data[0];
        updatePriceState(courseData.price);
      }
    } catch (error) {
      console.error("Error fetching course price:", error);
      toast.error("Không thể tải thông tin giá khóa học");
    } finally {
      setRefreshing(false);
    }
  };

  const updatePriceState = (coursePrice) => {
    const priceValue = coursePrice || 0;
    setCurrentPrice(priceValue);
    setPriceType(priceValue > 0 ? "paid" : "free");
    setPrice(priceValue);
  };

  const handleSavePrice = async () => {
    try {
      setLoading(true);

      const finalPrice = priceType === "free" ? 0 : price;

      if (priceType === "paid" && (!finalPrice || finalPrice <= 0)) {
        toast.error("Vui lòng nhập giá hợp lệ cho khóa học trả phí");
        return;
      }

      const response = await axiosInstance.put(
        `/Course/Set-Price/${courseId}`,
        { price: finalPrice }
      );

      if (response.data.code === 200) {
        toast.success("Cập nhật giá khóa học thành công!");
        
        // Update local state
        setCurrentPrice(finalPrice);
        
        // Notify parent component to refresh course data and mark pricing as completed
        if (onUpdate) {
          onUpdate({ pricingCompleted: true });
        }
        
        // Fetch fresh data to ensure sync
        await fetchCoursePrice();
      }
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật giá");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrice = () => {
    fetchCoursePrice();
  };

  const formatPrice = (value) => {
    if (!value || value === 0) return "Miễn phí";
    return `${value.toLocaleString("vi-VN")}đ`;
  };

  const hasChanges = () => {
    if (currentPrice === null) return false;
    const newPrice = priceType === "free" ? 0 : price;
    return newPrice !== currentPrice;
  };

  if (!course && !courseId) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Đang tải thông tin khóa học...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Giá khóa học</h2>
              <p className="text-sm text-gray-600">
                Thiết lập giá bán cho khóa học của bạn
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPrice}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>

          {/* Current Price Display */}
          <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-green-700 mb-1 font-medium">
                  Giá hiện tại
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {formatPrice(currentPrice)}
                </p>
                {currentPrice === 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Học viên có thể đăng ký miễn phí
                  </p>
                )}
                {currentPrice > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Học viên cần thanh toán để đăng ký
                  </p>
                )}
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Information Banner */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Lưu ý về giá khóa học:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Khóa học miễn phí sẽ thu hút nhiều học viên hơn</li>
                <li>Khóa học trả phí nên có giá trị rõ ràng và nội dung chất lượng</li>
                <li>Bạn có thể thay đổi giá sau khi xuất bản</li>
              </ul>
            </div>
          </div>

          {/* Price Type Selection */}
          <div className="space-y-3 mb-5">
            <label className="block text-sm font-medium text-gray-700">
              Loại giá <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  priceType === "free"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => setPriceType("free")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="priceType"
                    checked={priceType === "free"}
                    onChange={() => setPriceType("free")}
                    className="w-4 h-4 accent-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Miễn phí</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Không yêu cầu thanh toán
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  priceType === "paid"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => setPriceType("paid")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="priceType"
                    checked={priceType === "paid"}
                    onChange={() => setPriceType("paid")}
                    className="w-4 h-4 accent-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Trả phí</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Yêu cầu thanh toán
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Price Input - Only show when paid */}
          {priceType === "paid" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá khóa học (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Nhập giá khóa học (ví dụ: 100000)"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  min="0"
                  step="1000"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  đ
                </div>
              </div>
              {price > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Giá hiển thị: <span className="font-semibold text-gray-700">{formatPrice(price)}</span>
                </p>
              )}
              {priceType === "paid" && (!price || price <= 0) && (
                <p className="text-sm text-red-500 mt-2">
                  Vui lòng nhập giá lớn hơn 0 cho khóa học trả phí
                </p>
              )}
            </div>
          )}

          {/* Price Examples */}
          {priceType === "paid" && (
            <div className="mb-5 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Gợi ý mức giá phổ biến:
              </p>
              <div className="flex flex-wrap gap-2">
                {[99000, 199000, 299000, 499000, 999000].map((suggestedPrice) => (
                  <button
                    key={suggestedPrice}
                    type="button"
                    onClick={() => setPrice(suggestedPrice)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    {formatPrice(suggestedPrice)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Change Indicator */}
          {hasChanges() && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Bạn có thay đổi chưa lưu. Nhấn nút bên dưới để lưu thay đổi.
              </p>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSavePrice}
            disabled={loading || refreshing || (priceType === "paid" && (!price || price <= 0))}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang lưu...
              </div>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingTab;