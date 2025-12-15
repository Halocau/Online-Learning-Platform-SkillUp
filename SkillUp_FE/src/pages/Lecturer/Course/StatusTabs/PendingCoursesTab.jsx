// src/pages/Lecturer/components/tabs/PendingCoursesTab.jsx
import { Lock, Info, Eye } from "lucide-react";
import BaseCourseTab from "./BaseCourseTab.jsx";

function PendingCoursesTab({ courses, onEdit, onDelete, onPreview, deletingId }) {
  const pendingCourses = courses.filter((c) => c.status === "Pending");

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-900" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-yellow-900 mb-1 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Lưu ý về khóa học đang chờ duyệt
            </h4>
            <p className="text-sm text-yellow-800 leading-relaxed">
              Các khóa học ở trạng thái <strong>"Chờ duyệt"</strong> đã được
              gửi để xét duyệt. Bạn <strong>không thể chỉnh sửa</strong> khóa
              học trong thời gian này.  Nhấn nút{" "}
              <Eye className="w-3 h-3 inline" /> <strong>Xem trước</strong> để
              xem lại nội dung khóa học.
            </p>
          </div>
        </div>
      </div>

      <BaseCourseTab
        courses={pendingCourses}
        onEdit={onEdit}
        onDelete={onDelete}
        onPreview={onPreview}
        deletingId={deletingId}
        emptyMessage="Không có khóa học chờ duyệt"
        emptyDescription="Các khóa học đã gửi duyệt sẽ hiển thị ở đây"
      />
    </div>
  );
}

export default PendingCoursesTab;