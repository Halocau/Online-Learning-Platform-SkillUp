import { memo } from "react";

const VoucherStats = memo(({ total, active, expired }) => (
    <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700 mb-1">Tổng</p>
            <p className="text-2xl font-bold text-yellow-900">{total}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700 mb-1">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-900">{active}</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700 mb-1">Đã hết hạn</p>
            <p className="text-2xl font-bold text-purple-900">{expired}</p>
        </div>
    </div>
));

VoucherStats.displayName = "VoucherStats";

export default VoucherStats;

