import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/config/api";
import { toast } from "sonner";

function PricingTab({ course, onUpdate }) {
  const [priceType, setPriceType] = useState(
    course?.price && course.price > 0 ? "paid" : "free"
  );
  const [price, setPrice] = useState(course?.price || 0);
  const [loading, setLoading] = useState(false);

  // Update state when course changes
  useEffect(() => {
    if (course) {
      setPriceType(course.price && course.price > 0 ? "paid" : "free");
      setPrice(course.price || 0);
    }
  }, [course]);

  const handleSavePrice = async () => {
    try {
      setLoading(true);

      const finalPrice = priceType === "free" ? 0 : price;

      if (priceType === "paid" && (!finalPrice || finalPrice <= 0)) {
        toast.error("Vui lòng nhập giá hợp lệ cho khóa học trả phí");
        return;
      }

      const response = await axiosInstance.put(
        `/Course/Set-Price/${course.id}`,
        { price: finalPrice }
      );

      if (response.data.code === 200) {
        toast.success("Cập nhật giá khóa học thành công!");
        // Gọi callback để update course data
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật giá");
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
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
          <h2 className="text-2xl font-bold mb-1">Giá khóa học</h2>
          <p className="text-sm text-gray-600 mb-6">
            Thiết lập giá bán cho khóa học của bạn
          </p>

          {/* Current Price */}
          <div className="mb-6 p-5 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Giá hiện tại</p>
                <p className="text-3xl font-bold text-green-900">
                  {course.price > 0
                    ? `${course.price.toLocaleString("vi-VN")}đ`
                    : "Miễn phí"}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Price Type */}
          <div className="space-y-3 mb-5">
            <label className="block text-sm font-medium">Loại giá</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                  priceType === "free"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
                onClick={() => setPriceType("free")}
              >
                <input
                  type="radio"
                  name="priceType"
                  checked={priceType === "free"}
                  onChange={() => setPriceType("free")}
                  className="mr-2"
                />
                <span className="font-medium">Miễn phí</span>
              </div>
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                  priceType === "paid"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
                onClick={() => setPriceType("paid")}
              >
                <input
                  type="radio"
                  name="priceType"
                  checked={priceType === "paid"}
                  onChange={() => setPriceType("paid")}
                  className="mr-2"
                />
                <span className="font-medium">Trả phí</span>
              </div>
            </div>
          </div>

          {/* Price Input - Only show when paid */}
          {priceType === "paid" && (
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                placeholder="Nhập giá khóa học"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="0"
                step="1000"
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Khuyến nghị: 100,000đ - 5,000,000đ
              </p>
            </div>
          )}

          <Button
            onClick={handleSavePrice}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>

          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              💡 Giá khóa học có thể thay đổi bất cứ lúc nào
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingTab;