import { useState, useEffect, useCallback, useMemo } from "react";
import { Ticket, Plus, Percent, Calendar, Users, X, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { voucherAPI } from "@/api/voucherAPI";
import { toast } from "sonner";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";
import VoucherCard from "@/components/Voucher/VoucherCard";
import VoucherStats from "@/components/Voucher/VoucherStats";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

// Constants
const CODE_LENGTH = 6;
const CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_VOUCHER_DURATION_DAYS = 2;
const DEFAULT_START_TIME_OFFSET_MINUTES = 1;

// Utility functions
const generateRandomCode = () => {
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += CODE_CHARACTERS.charAt(Math.floor(Math.random() * CODE_CHARACTERS.length));
  }
  return result;
};

const formatLocalDateTime = (dayjsDate) => {
  if (!dayjsDate) return null;
  return dayjsDate.format('YYYY-MM-DDTHH:mm:ss');
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

function VoucherTab({ course, courseId }) {
  const [vouchers, setVouchers] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    couponCode: "",
    voucherType: 1,
    price: 0,
    discountAmount: 0,
    startTime: null,
    endTime: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const originalPrice = useMemo(() => course?.price || 0, [course?.price]);

  // Memoize selected voucher type
  const selectedVoucherType = useMemo(
    () => voucherTypes.find(t => t.id === formData.voucherType),
    [voucherTypes, formData.voucherType]
  );

  // Memoize final price calculation
  const finalPrice = useMemo(() => {
    if (originalPrice <= 0) return 0;
    if (!selectedVoucherType) return 0;

    if (selectedVoucherType.percentage > 0) {
      return Math.round(originalPrice * (1 - selectedVoucherType.percentage / 100));
    } else {
      return Math.max(0, originalPrice - formData.discountAmount);
    }
  }, [originalPrice, selectedVoucherType, formData.discountAmount]);

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getCourseVouchers(courseId);
      if (response.data?.code === 200) {
        const voucherList = response.data.data[0] || [];
        setVouchers(Array.isArray(voucherList) ? voucherList : []);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Không thể tải danh sách voucher");
      }
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const loadVoucherTypes = useCallback(async () => {
    try {
      const response = await voucherAPI.getAllVoucherTypes();
      if (response.data?.code === 200) {
        const types = response.data.data[0] || [];
        setVoucherTypes(Array.isArray(types) ? types : []);
        if (types.length > 0) {
          setFormData(prev => {
            if (!prev.voucherType) {
              return { ...prev, voucherType: types[0].id };
            }
            return prev;
          });
        }
      }
    } catch {
      // Silent fail for voucher types
    }
  }, []);

  const handleRandomCode = useCallback(() => {
    const randomCode = generateRandomCode();
    setFormData(prev => ({
      ...prev,
      couponCode: randomCode,
    }));
  }, []);

  useEffect(() => {
    if (courseId) {
      loadVouchers();
      loadVoucherTypes();
    }
  }, [courseId, loadVouchers, loadVoucherTypes]);

  const handleCreateVoucher = useCallback(() => {
    setEditingVoucher(null);
    const now = dayjs();
    const defaultStartTime = now.add(DEFAULT_START_TIME_OFFSET_MINUTES, 'minute');
    const defaultEndTime = defaultStartTime.add(DEFAULT_VOUCHER_DURATION_DAYS, 'day');

    setFormData({
      couponCode: "",
      voucherType: voucherTypes.length > 0 ? voucherTypes[0].id : 1,
      price: 0,
      discountAmount: 0,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    });
    setShowCreateForm(true);
  }, [voucherTypes]);

  const handleEditVoucher = useCallback((voucher) => {
    setEditingVoucher(voucher);
    const selectedType = voucherTypes.find(t => t.id === voucher.voucherType);
    let discountAmount = 0;
    if (selectedType && selectedType.percentage === 0 && originalPrice > 0) {
      discountAmount = originalPrice - voucher.price;
    }

    setFormData({
      couponCode: voucher.couponCode,
      voucherType: voucher.voucherType,
      price: voucher.price,
      discountAmount: discountAmount,
      startTime: voucher.startTime ? dayjs(voucher.startTime) : null,
      endTime: voucher.endTime ? dayjs(voucher.endTime) : null,
    });
    setShowCreateForm(true);
  }, [voucherTypes, originalPrice]);

  const handleDeleteVoucher = useCallback(async (voucherId) => {
    try {
      const response = await voucherAPI.deleteVoucher(voucherId);
      if (response.data?.code === 200) {
        toast.success(response.data.message || "Xóa voucher thành công!");
        loadVouchers();
      } else {
        toast.error(response.data?.message || "Không thể xóa voucher");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa voucher");
    }
  }, [loadVouchers]);

  const handleCloseForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingVoucher(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.couponCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    if (formData.endTime.isBefore(formData.startTime) || formData.endTime.isSame(formData.startTime)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    if (selectedVoucherType && selectedVoucherType.percentage === 0) {
      if (formData.discountAmount <= 0) {
        toast.error("Vui lòng nhập số tiền giảm hợp lệ");
        return;
      }
      if (formData.discountAmount > originalPrice) {
        toast.error("Số tiền giảm không được vượt quá giá gốc");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        CourseId: courseId,
        CouponCode: formData.couponCode.toUpperCase().trim(),
        VoucherType: formData.voucherType,
        Price: finalPrice,
        StartTime: formatLocalDateTime(formData.startTime),
        EndTime: formatLocalDateTime(formData.endTime),
      };

      if (editingVoucher) {
        await voucherAPI.updateVoucher(editingVoucher.id, payload);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await voucherAPI.addVoucher(payload);
        toast.success("Tạo voucher thành công!");
      }

      handleCloseForm();
      loadVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu voucher");
    } finally {
      setSubmitting(false);
    }
  }, [formData, selectedVoucherType, originalPrice, finalPrice, courseId, editingVoucher, handleCloseForm, loadVouchers]);

  // Memoize filtered vouchers
  const { activeVouchers, expiredVouchers } = useMemo(() => {
    const active = vouchers.filter(isVoucherActive);
    const expired = vouchers.filter((v) => {
      if (!v.isActive) return false;
      const now = new Date();
      const endTime = v.endTime ? new Date(v.endTime) : null;
      return endTime && now > endTime;
    });
    return { activeVouchers: active, expiredVouchers: expired };
  }, [vouchers]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải danh sách voucher...</p>
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
              <h2 className="text-2xl font-bold mb-1">Mã giảm giá</h2>
              <p className="text-sm text-gray-600">
                Tạo voucher để thu hút học viên
              </p>
            </div>
            <Button
              onClick={handleCreateVoucher}
              className="bg-[#FCCD04] hover:bg-[#E6B800] text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo voucher
            </Button>
          </div>

          {/* Voucher Types Info */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Percent className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Giảm theo %</h4>
              <p className="text-xs text-gray-600">VD: 20% off</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Calendar className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Có thời hạn</h4>
              <p className="text-xs text-gray-600">Thiết lập thời gian</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Users className="w-8 h-8 text-yellow-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Áp dụng cho khóa học</h4>
              <p className="text-xs text-gray-600">Chỉ cho khóa học này</p>
            </div>
          </div>

          {/* Create/Edit Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      {editingVoucher ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseForm}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mã voucher <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.couponCode}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              couponCode: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="VD: SALE20, SUMMER2024"
                          className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#FCCD04] focus:border-[#FCCD04]"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleRandomCode}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          title="Tạo mã ngẫu nhiên"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.voucherType}
                        onChange={(e) => {
                          const newVoucherType = Number(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            voucherType: newVoucherType,
                            discountAmount: 0,
                          }));
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FCCD04] focus:border-[#FCCD04]"
                        required
                      >
                        {voucherTypes.length > 0 ? (
                          voucherTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name} {type.percentage > 0 ? `(${type.percentage}%)` : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value={1}>Giảm theo phần trăm (%)</option>
                            <option value={2}>Giảm số tiền cố định (VNĐ)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Hiển thị giá gốc */}
                    {originalPrice > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Giá gốc khóa học</p>
                            <p className="text-lg font-bold text-blue-900">
                              {originalPrice.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedVoucherType?.percentage > 0 ? (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phần trăm giảm (%)
                        </label>
                        <input
                          type="text"
                          value={`${selectedVoucherType.percentage}%`}
                          disabled
                          className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Phần trăm giảm được quy định bởi loại voucher đã chọn
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Số tiền giảm (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.discountAmount}
                          onChange={(e) => {
                            const discount = Number(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              discountAmount: discount >= 0 ? discount : 0,
                            }));
                          }}
                          placeholder="VD: 50000"
                          min="0"
                          step="1000"
                          max={originalPrice}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FCCD04] focus:border-[#FCCD04]"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập số tiền được giảm (tối đa {originalPrice.toLocaleString("vi-VN")}đ)
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Giá sau khi giảm (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={finalPrice > 0 ? finalPrice.toLocaleString("vi-VN") : "0"}
                        disabled
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedVoucherType?.percentage > 0
                          ? `Giá được tính tự động: ${originalPrice.toLocaleString("vi-VN")}đ - ${selectedVoucherType.percentage}% = ${finalPrice.toLocaleString("vi-VN")}đ`
                          : `Giá được tính tự động: ${originalPrice.toLocaleString("vi-VN")}đ - ${formData.discountAmount.toLocaleString("vi-VN")}đ = ${finalPrice.toLocaleString("vi-VN")}đ`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Thời gian bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          showTime={{ format: 'HH:mm' }}
                          format="DD/MM/YYYY HH:mm"
                          placeholder="Chọn thời gian bắt đầu"
                          value={formData.startTime}
                          onChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              startTime: value,
                            }));
                          }}
                          onOk={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              startTime: value,
                            }));
                          }}
                          style={{ width: '100%' }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Thời gian kết thúc <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          showTime={{ format: 'HH:mm' }}
                          format="DD/MM/YYYY HH:mm"
                          placeholder="Chọn thời gian kết thúc"
                          value={formData.endTime}
                          onChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              endTime: value,
                            }));
                          }}
                          onOk={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              endTime: value,
                            }));
                          }}
                          disabledDate={(current) => {
                            if (!formData.startTime) return false;
                            return current && current.isBefore(formData.startTime, 'day');
                          }}
                          style={{ width: '100%' }}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-[#FCCD04] hover:bg-[#E6B800] text-black font-semibold"
                      >
                        {submitting
                          ? "Đang lưu..."
                          : editingVoucher
                            ? "Cập nhật"
                            : "Tạo voucher"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseForm}
                        disabled={submitting}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Vouchers List */}
          {vouchers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Ticket className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Chưa có voucher</h3>
              <p className="text-gray-500 mb-4 text-sm">
                Tạo voucher đầu tiên để bắt đầu
              </p>
              <Button
                onClick={handleCreateVoucher}
                className="bg-[#FCCD04] hover:bg-[#E6B800] text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo voucher
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  voucherTypes={voucherTypes}
                  onEdit={handleEditVoucher}
                  onDelete={handleDeleteVoucher}
                />
              ))}
            </div>
          )}

          <VoucherStats
            total={vouchers.length}
            active={activeVouchers.length}
            expired={expiredVouchers.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default VoucherTab;
