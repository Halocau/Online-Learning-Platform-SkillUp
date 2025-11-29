import { useState, useEffect } from "react";
import { paymentAPI } from "@/api/paymentAPI";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, CreditCard, ChevronDown, ChevronUp, Star, Package2 } from "lucide-react";

function PurchaseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTransactions, setExpandedTransactions] = useState({});

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      const data = await paymentAPI.getPurchaseHistory();
      setHistory(data);
      // Expand first transaction by default
      if (data.length > 0) {
        setExpandedTransactions({ [data[0].transactionId]: true });
      }
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      toast.error("Không thể tải lịch sử mua hàng");
    } finally {
      setLoading(false);
    }
  };

  const toggleTransaction = (transactionId) => {
    setExpandedTransactions((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `Ngày ${day} ${month}, ${year} lúc ${hours}:${minutes}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe] py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lịch Sử Mua Hàng
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Xem lại các giao dịch và khóa học bạn đã mua
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có lịch sử mua hàng
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa thực hiện giao dịch nào. Hãy khám phá và đăng ký các khóa học ngay!
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((transaction) => {
              const isExpanded = expandedTransactions[transaction.transactionId];
              
              return (
                <div
                  key={transaction.transactionId}
                  className="border-2 border-blue-500 rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow"
                >
                  {/* Transaction Header - Clickable */}
                  <div
                    onClick={() => toggleTransaction(transaction.transactionId)}
                    className={`p-5 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
                      isExpanded ? 'bg-gradient-to-r from-orange-50 to-amber-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={`text-sm mb-3 font-semibold ${
                          isExpanded ? 'text-orange-600' : 'text-gray-700'
                        }`}>
                          {formatDate(transaction.createdAt)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            isExpanded ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <Package2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              {transaction.courses?.length || 0} Khóa học
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            isExpanded ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <span className="font-bold text-orange-600">
                              {formatCurrency(transaction.totalAmount)}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            isExpanded ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">
                              {transaction.paymentMethod || "Thẻ tín dụng"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white rounded-full transition-colors ml-4">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Course Details */}
                  {isExpanded && (
                    <div className="bg-gradient-to-b from-gray-50 to-white border-t-2 border-orange-200">
                      <div className="p-6">
                        {/* Transaction Summary */}
                        <div className="mb-6 p-5 bg-white rounded-xl border-2 border-orange-200 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Thông tin giao dịch
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Thời gian:</span> {formatDate(transaction.createdAt)}</p>
                                {transaction.description && (
                                  <p><span className="font-medium">Mô tả:</span> {transaction.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">Tổng thanh toán</div>
                              <div className="text-2xl font-bold text-orange-600">
                                {formatCurrency(transaction.totalAmount)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Courses List */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Package2 className="w-5 h-5 text-blue-600" />
                            Các khóa học đã mua ({transaction.courses?.length || 0})
                          </h3>
                          <div className="space-y-3">
                            {transaction.courses?.map((course) => (
                              <Link
                                key={course.courseId}
                                to={`/course/${course.courseId}`}
                                className="flex gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md bg-white transition-all group"
                              >
                                <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                                  {course.courseImage ? (
                                    <img
                                      src={course.courseImage}
                                      alt={course.courseTitle}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <ShoppingBag className="w-8 h-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs text-gray-600 font-medium">
                                      {course.rating ? course.rating.toFixed(1) : "Chưa có rating"}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {course.courseTitle}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Giảng viên: {course.lecturerName || "Đang cập nhật"}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col justify-center">
                                  <p className="text-xl font-bold text-orange-600">
                                    {formatCurrency(course.pricePaid)}
                                  </p>
                                  <span className="text-xs text-gray-500 mt-1">Đã thanh toán</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseHistory;
