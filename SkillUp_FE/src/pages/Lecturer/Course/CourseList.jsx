import { useState } from "react";
import { BookOpen, FileText, Eye, EyeOff, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import AllCoursesTab from "./StatusTabs/AllCoursesTab.jsx";
import DraftCoursesTab from "./StatusTabs/DraftCoursesTab.jsx";
import PublicCoursesTab from "./StatusTabs/PublicCoursesTab.jsx";
import UnpublishCoursesTab from "./StatusTabs/UnpublishCoursesTab.jsx";
import PendingCoursesTab from "./StatusTabs/PendingCoursesTab.jsx";

function CourseList({
  courses,
  loading,
  onRefresh,
  onCreateClick,
  onEdit,
  onPreview,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
    loading: false,
  });

  const openConfirmModal = (config) => {
    setConfirmModal({
      isOpen: true,
      loading: false,
      ...config,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      type: "warning",
      onConfirm: null,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.onConfirm) {
      setConfirmModal((prev) => ({ ...prev, loading: true }));
      await confirmModal.onConfirm();
      closeConfirmModal();
    }
  };

  const statusTabs = [
    {
      id: "all",
      label: "Tất cả",
      icon: BookOpen,
      color: "blue",
      component: AllCoursesTab,
    },
    {
      id: "Draft",
      label: "Nháp",
      icon: FileText,
      color: "gray",
      component: DraftCoursesTab,
    },
    {
      id: "Public",
      label: "Đã xuất bản",
      icon: Eye,
      color: "green",
      component: PublicCoursesTab,
    },
    {
      id: "Unpublish",
      label: "Đã ẩn",
      icon: EyeOff,
      color: "orange",
      component: UnpublishCoursesTab,
    },
    {
      id: "Pending",
      label: "Chờ duyệt",
      icon: Check,
      color: "yellow",
      component: PendingCoursesTab,
    },
  ];

  const handleEdit = (courseId) => {
    const courseToEdit = courses.find((c) => c.id === courseId);

    if (courseToEdit && onEdit) {
      onEdit(courseId, courseToEdit);
    } else {
      toast.error("Không tìm thấy thông tin khóa học");
    }
  };

  const handlePreview = (course) => {
    if (onPreview) onPreview(course);
  };

  const handleDelete = async (courseId) => {
    openConfirmModal({
      title: "Ẩn khóa học",
      message: "Bạn có chắc chắn muốn ẩn khóa học này không?",
      type: "danger",
      confirmText: "Ẩn",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          setDeletingId(courseId);
          const response = await courseAPI.deleteCourse(courseId);

          if (response.data.code === 200) {
            toast.success("Khóa học đã được ẩn thành công");
            setDeletingId(null); // ✅ RESET deletingId BEFORE refresh
            setTimeout(() => {
              onRefresh();
            }, 500);
          } else {
            toast.error(response.data.message || "Lỗi khi ẩn khóa học");
            setDeletingId(null);
          }
        } catch (error) {
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Lỗi khi ẩn khóa học.  Vui lòng thử lại.");
          }
          setDeletingId(null);
        }
      },
    });
  };

  const handleReopen = async (courseId) => {
    openConfirmModal({
      title: "Mở lại khóa học",
      message: "Bạn có chắc chắn muốn mở lại khóa học này không?",
      type: "info",
      confirmText: "Mở lại",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          setDeletingId(courseId);
          const response = await courseAPI.reopenCourse(courseId);

          if (response.data.code === 200) {
            toast.success("Khóa học đã được mở lại thành công!");
            setDeletingId(null); // ✅ RESET deletingId BEFORE refresh
            setTimeout(() => {
              onRefresh();
            }, 500);
          } else {
            toast.error(response.data.message || "Lỗi khi mở lại khóa học");
            setDeletingId(null);
          }
        } catch (error) {
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Lỗi khi mở lại khóa học. Vui lòng thử lại.");
          }
          setDeletingId(null);
        }
      },
    });
  };

  const getTabColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive
        ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-transparent",
      gray: isActive
        ? "bg-gray-100 text-gray-700 border-gray-300 shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-600 border-transparent",
      green: isActive
        ? "bg-green-100 text-green-700 border-green-300 shadow-sm"
        : "text-gray-600 hover:bg-green-50 hover:text-green-600 border-transparent",
      orange: isActive
        ? "bg-orange-100 text-orange-700 border-orange-300 shadow-sm"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-transparent",
      yellow: isActive
        ? "bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm"
        : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 border-transparent",
    };
    return colors[color] || colors.blue;
  };

  const getStatusCount = (status) => {
    if (status === "all") return courses.length;
    return courses.filter((c) => c.status === status).length;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
      </div>
    );
  }

  const ActiveTabComponent = statusTabs.find(
    (tab) => tab.id === filterStatus
  )?.component;

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        loading={confirmModal.loading}
      />

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filterStatus === tab.id;
            const count = getStatusCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2. 5 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 border ${getTabColorClasses(
                  tab.color,
                  isActive
                )} ${isActive ? "transform scale-105" : ""}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                    ? "bg-white bg-opacity-80"
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      {ActiveTabComponent && (
        <ActiveTabComponent
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={handlePreview}
          onReopen={handleReopen}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}

export default CourseList;