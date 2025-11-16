import { memo } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popconfirm } from "antd";

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const isVoucherActive = (voucher) => {
    if (!voucher.isActive) return false;
    const now = new Date();
    const startTime = voucher.startTime ? new Date(voucher.startTime) : null;
    const endTime = voucher.endTime ? new Date(voucher.endTime) : null;

    if (startTime && now < startTime) return false;
    if (endTime && now > endTime) return false;
    return true;
};

const VoucherCard = memo(({ voucher, voucherTypes, onEdit, onDelete }) => {
    const active = isVoucherActive(voucher);
    const expired = voucher.endTime && new Date(voucher.endTime) < new Date();
    const type = voucherTypes.find(t => t.id === voucher.voucherType);

    const getTypeLabel = () => {
        if (type) {
            return type.percentage > 0
                ? `${type.name} (Giảm ${type.percentage}%)`
                : type.name;
        }
        return voucher.voucherType === 1
            ? "Giảm theo phần trăm"
            : "Giảm số tiền cố định";
    };

    return (
        <div
            className={`p-4 rounded-lg border-2 ${active
                    ? "border-green-200 bg-green-50"
                    : expired
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white"
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-[#FCCD04]">
                            {voucher.couponCode}
                        </span>
                        {active && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                Đang hoạt động
                            </span>
                        )}
                        {expired && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                                Đã hết hạn
                            </span>
                        )}
                        {!voucher.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                Đã vô hiệu hóa
                            </span>
                        )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p>
                            <strong>Loại:</strong> {getTypeLabel()}
                        </p>
                        <p>
                            <strong>Giá sau khi giảm:</strong>{" "}
                            {voucher.price.toLocaleString("vi-VN")}đ
                        </p>
                        <p>
                            <strong>Bắt đầu:</strong> {formatDate(voucher.startTime)}
                        </p>
                        <p>
                            <strong>Kết thúc:</strong> {formatDate(voucher.endTime)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(voucher)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa voucher"
                        description="Bạn có chắc chắn muốn xóa voucher này?"
                        onConfirm={() => onDelete(voucher.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </Popconfirm>
                </div>
            </div>
        </div>
    );
});

VoucherCard.displayName = "VoucherCard";

export default VoucherCard;

