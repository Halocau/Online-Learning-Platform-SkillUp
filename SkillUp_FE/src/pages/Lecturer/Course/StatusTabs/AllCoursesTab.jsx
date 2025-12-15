// src/pages/Lecturer/components/tabs/AllCoursesTab. jsx
import BaseCourseTab from "./BaseCourseTab.jsx";

function AllCoursesTab({ courses, onEdit, onDelete, onPreview, onReopen, deletingId }) {
  return (
    <BaseCourseTab
      courses={courses}
      onEdit={onEdit}
      onDelete={onDelete}
      onPreview={onPreview}
      onReopen={onReopen}
      deletingId={deletingId}
      emptyMessage="Chưa có khóa học nào"
      emptyDescription="Bắt đầu tạo khóa học đầu tiên của bạn"
    />
  );
}

export default AllCoursesTab;