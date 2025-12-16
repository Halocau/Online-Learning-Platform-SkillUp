// src/pages/Lecturer/components/tabs/DraftCoursesTab.jsx
import BaseCourseTab from "./BaseCourseTab.jsx";

function DraftCoursesTab({ courses, onEdit, onDelete, onPreview, deletingId }) {
  const draftCourses = courses.filter((c) => c.status === "Draft");

  return (
    <BaseCourseTab
      courses={draftCourses}
      onEdit={onEdit}
      onDelete={onDelete}
      onPreview={onPreview}
      deletingId={deletingId}
      emptyMessage="Không có khóa học nháp"
      emptyDescription="Các khóa học chưa hoàn thành sẽ hiển thị ở đây"
    />
  );
}

export default DraftCoursesTab;