import { Ticket, Plus, Percent, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VoucherTab({ course }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Mã giảm giá</h2>
              <p className="text-sm text-gray-600">
                Tạo voucher để thu hút học viên
              </p>
            </div>
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4 mr-2" />
              Tạo voucher
            </Button>
          </div>

          {/* Voucher Types */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Percent className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Giảm theo %</h4>
              <p className="text-xs text-gray-600">VD: 20% off</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Calendar className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Flash Sale</h4>
              <p className="text-xs text-gray-600">Có thời hạn</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Ưu đãi nhóm</h4>
              <p className="text-xs text-gray-600">Đăng ký nhóm</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Ticket className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Chưa có voucher</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Tạo voucher đầu tiên để bắt đầu
            </p>
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4 mr-2" />
              Tạo voucher
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Tổng</p>
              <p className="text-2xl font-bold text-blue-900">0</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Đang dùng</p>
              <p className="text-2xl font-bold text-green-900">0</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 mb-1">Đã dùng</p>
              <p className="text-2xl font-bold text-purple-900">0</p>
            </div>
          </div>

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

export default VoucherTab;
