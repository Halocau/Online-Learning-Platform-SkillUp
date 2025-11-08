import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PricingTab({ course }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-1">Giá khóa học</h2>
          <p className="text-sm text-gray-600 mb-6">
            Thiết lập giá bán
          </p>

          {/* Current Price */}
          <div className="mb-6 p-5 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Giá hiện tại</p>
                <p className="text-3xl font-bold text-green-900">
                  {course?.price > 0
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
              <div className="p-3 border-2 rounded-lg cursor-pointer hover:border-green-500">
                <input
                  type="radio"
                  name="priceType"
                  defaultChecked={course?.price === 0}
                  className="mr-2"
                />
                <span className="font-medium">Miễn phí</span>
              </div>
              <div className="p-3 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="priceType"
                  defaultChecked={course?.price > 0}
                  className="mr-2"
                />
                <span className="font-medium">Trả phí</span>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              placeholder="0"
              defaultValue={course?.price || 0}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Khuyến nghị: 100,000đ - 5,000,000đ
            </p>
          </div>

          <Button disabled className="w-full opacity-50 cursor-not-allowed">
            Lưu thay đổi (Đang phát triển)
          </Button>

          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-800">
              Tính năng đang được phát triển
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingTab;