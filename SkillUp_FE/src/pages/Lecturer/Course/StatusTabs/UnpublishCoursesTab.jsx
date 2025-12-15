// src/pages/Lecturer/components/tabs/UnpublishCoursesTab.jsx
import { Edit2, EyeOff, Info, Unlock } from "lucide-react";
import BaseCourseTab from "./BaseCourseTab.jsx";

function UnpublishCoursesTab({
  courses,
  onEdit,
  onDelete,
  onReopen,
  deletingId,
}) {
  const unpublishCourses = courses.filter((c) => c.status === "Unpublish");

  return (
    <div className="space-y-6">
      {/* Info Banner for Unpublish Courses */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-orange-900" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-orange-900 mb-1 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Lưu ý về khóa học đã ẩn
            </h4>
            <p className="text-sm text-orange-800 leading-relaxed">
              Các khóa học ở trạng thái <strong>"Đã ẩn"</strong> không hiển thị
              công khai. Bạn có thể <strong>mở lại khóa học</strong> bằng cách
              nhấn nút <Unlock className="w-3 h-3 inline" />{" "}
              <strong>Mở lại</strong> hoặc <Edit2 className="w-3 h-3 inline" />{" "}
              <strong>Chỉnh sửa</strong> nội dung trước khi mở lại.
            </p>
          </div>
        </div>
      </div>

      <BaseCourseTab
        courses={unpublishCourses}
        onEdit={onEdit}
        onDelete={onDelete}
        onReopen={onReopen}
        deletingId={deletingId}
        emptyMessage="Không có khóa học bị ẩn"
        emptyDescription="Các khóa học đã bị ẩn sẽ hiển thị ở đây"
      />
    </div>
  );
}

export default UnpublishCoursesTab;
