import { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Percent, Calendar, Users, Edit2, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { voucherAPI } from "@/api/voucherAPI";
import { toast } from "sonner";
import { DatePicker, Popconfirm } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

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
    discountAmount: 0, // Số tiền giảm (cho loại giảm số tiền cố định)
    startTime: null,
    endTime: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Lấy giá gốc của khóa học
  const originalPrice = course?.price || 0;

  // Tính toán giá sau khi giảm tự động
  const calculateFinalPrice = () => {
    if (originalPrice <= 0) return 0;

    const selectedType = voucherTypes.find(t => t.id === formData.voucherType);
    if (!selectedType) return 0;

    if (selectedType.percentage > 0) {
      // Giảm theo phần trăm
      return Math.round(originalPrice * (1 - selectedType.percentage / 100));
    } else {
      // Giảm số tiền cố định
      const finalPrice = originalPrice - formData.discountAmount;
      return Math.max(0, finalPrice); // Đảm bảo không âm
    }
  };

  const finalPrice = calculateFinalPrice();

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getCourseVouchers(courseId);
      if (response.data && response.data.code === 200) {
        const voucherList = response.data.data[0] || [];
        setVouchers(Array.isArray(voucherList) ? voucherList : []);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
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
      if (response.data && response.data.code === 200) {
        const types = response.data.data[0] || [];
        setVoucherTypes(Array.isArray(types) ? types : []);
        // Set default voucher type if available
        if (types.length > 0) {
          setFormData(prev => {
            if (!prev.voucherType) {
              return { ...prev, voucherType: types[0].id };
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Error loading voucher types:", error);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      loadVouchers();
      loadVoucherTypes();
    }
  }, [courseId, loadVouchers, loadVoucherTypes]);

  const handleCreateVoucher = () => {
    setEditingVoucher(null);
    setFormData({
      couponCode: "",
      voucherType: voucherTypes.length > 0 ? voucherTypes[0].id : 1,
      price: 0,
      discountAmount: 0,
      startTime: null,
      endTime: null,
    });
    setShowCreateForm(true);
  };

  const handleEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    const selectedType = voucherTypes.find(t => t.id === voucher.voucherType);
    // Tính ngược lại số tiền giảm nếu là loại giảm số tiền cố định
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
  };

  const handleDeleteVoucher = async (voucherId) => {
    try {
      console.log("Confirm delete, calling API with voucherId:", voucherId);
      const response = await voucherAPI.deleteVoucher(voucherId);
      console.log("Delete response:", response);
      if (response.data && response.data.code === 200) {
        toast.success(response.data.message || "Xóa voucher thành công!");
        loadVouchers();
      } else {
        toast.error(response.data?.message || "Không thể xóa voucher");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error(error.response?.data?.message || "Không thể xóa voucher");
    }
  };

  const handleSubmit = async (e) => {
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

    // // Kiểm tra giá sau khi giảm
    // if (finalPrice <= 0) {
    //   toast.error("Giá sau khi giảm phải lớn hơn 0");
    //   return;
    // }

    // Kiểm tra số tiền giảm cho loại giảm số tiền cố định
    const selectedType = voucherTypes.find(t => t.id === formData.voucherType);
    if (selectedType && selectedType.percentage === 0) {
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
        Price: finalPrice, // Sử dụng giá đã tính tự động
        StartTime: formData.startTime.toISOString(),
        EndTime: formData.endTime.toISOString(),
      };

      if (editingVoucher) {
        await voucherAPI.updateVoucher(editingVoucher.id, payload);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await voucherAPI.addVoucher(payload);
        toast.success("Tạo voucher thành công!");
      }

      setShowCreateForm(false);
      setEditingVoucher(null);
      loadVouchers();
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast.error(error.response?.data?.message || "Không thể lưu voucher");
    } finally {
      setSubmitting(false);
    }
  };

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

  const activeVouchers = vouchers.filter((v) => isVoucherActive(v));
  const expiredVouchers = vouchers.filter((v) => {
    if (!v.isActive) return false;
    const now = new Date();
    const endTime = v.endTime ? new Date(v.endTime) : null;
    return endTime && now > endTime;
  });

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
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingVoucher(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mã voucher <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            couponCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="VD: SALE20, SUMMER2024"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FCCD04] focus:border-[#FCCD04]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.voucherType}
                        onChange={(e) => {
                          const newVoucherType = Number(e.target.value);
                          setFormData({
                            ...formData,
                            voucherType: newVoucherType,
                            discountAmount: 0, // Reset số tiền giảm khi đổi loại
                          });
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

                    {(() => {
                      const selectedType = voucherTypes.find(t => t.id === formData.voucherType);
                      if (selectedType?.percentage > 0) {
                        return (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Phần trăm giảm (%)
                            </label>
                            <input
                              type="text"
                              value={`${selectedType.percentage}%`}
                              disabled
                              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Phần trăm giảm được quy định bởi loại voucher đã chọn
                            </p>
                          </div>
                        );
                      } else {
                        // Loại giảm số tiền cố định
                        return (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Số tiền giảm (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.discountAmount}
                              onChange={(e) => {
                                const discount = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  discountAmount: discount >= 0 ? discount : 0,
                                });
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
                        );
                      }
                    })()}

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
                        {(() => {
                          const selectedType = voucherTypes.find(t => t.id === formData.voucherType);
                          if (selectedType?.percentage > 0) {
                            return `Giá được tính tự động: ${originalPrice.toLocaleString("vi-VN")}đ - ${selectedType.percentage}% = ${finalPrice.toLocaleString("vi-VN")}đ`;
                          } else {
                            return `Giá được tính tự động: ${originalPrice.toLocaleString("vi-VN")}đ - ${formData.discountAmount.toLocaleString("vi-VN")}đ = ${finalPrice.toLocaleString("vi-VN")}đ`;
                          }
                        })()}
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
                            setFormData({
                              ...formData,
                              startTime: value,
                            });
                          }}
                          onOk={(value) => {
                            setFormData({
                              ...formData,
                              startTime: value,
                            });
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
                            setFormData({
                              ...formData,
                              endTime: value,
                            });
                          }}
                          onOk={(value) => {
                            setFormData({
                              ...formData,
                              endTime: value,
                            });
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
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingVoucher(null);
                        }}
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
              {vouchers.map((voucher) => {
                const isActive = isVoucherActive(voucher);
                const isExpired =
                  voucher.endTime && new Date(voucher.endTime) < new Date();

                return (
                  <div
                    key={voucher.id}
                    className={`p-4 rounded-lg border-2 ${isActive
                      ? "border-green-200 bg-green-50"
                      : isExpired
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
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              Đang hoạt động
                            </span>
                          )}
                          {isExpired && (
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
                            <strong>Loại:</strong>{" "}
                            {(() => {
                              const type = voucherTypes.find(t => t.id === voucher.voucherType);
                              if (type) {
                                return type.percentage > 0
                                  ? `${type.name} (Giảm ${type.percentage}%)`
                                  : type.name;
                              }
                              return voucher.voucherType === 1
                                ? "Giảm theo phần trăm"
                                : "Giảm số tiền cố định";
                            })()}
                          </p>
                          <p>
                            <strong>Giá sau khi giảm:</strong>{" "}
                            {voucher.price.toLocaleString("vi-VN")}đ
                          </p>
                          <p>
                            <strong>Bắt đầu:</strong>{" "}
                            {formatDate(voucher.startTime)}
                          </p>
                          <p>
                            <strong>Kết thúc:</strong> {formatDate(voucher.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVoucher(voucher)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa voucher"
                          description="Bạn có chắc chắn muốn xóa voucher này?"
                          onConfirm={() => handleDeleteVoucher(voucher.id)}
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
              })}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700 mb-1">Tổng</p>
              <p className="text-2xl font-bold text-yellow-900">
                {vouchers.length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-900">
                {activeVouchers.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 mb-1">Đã hết hạn</p>
              <p className="text-2xl font-bold text-purple-900">
                {expiredVouchers.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VoucherTab;
