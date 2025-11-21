// src/components/ui/ConfirmModal.jsx
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "warning", // warning, danger, info, success
  loading = false,
}) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      buttonClass: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
  };

  const style = typeStyles[type] || typeStyles.warning;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`${style.iconBg} p-3 rounded-full`}>
            <Icon className={`w-8 h-8 ${style.iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-white ${style.buttonClass}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;