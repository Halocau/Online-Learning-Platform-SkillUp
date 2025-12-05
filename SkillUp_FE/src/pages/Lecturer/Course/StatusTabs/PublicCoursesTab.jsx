// src/pages/Lecturer/components/tabs/PublicCoursesTab.jsx
import BaseCourseTab from "./BaseCourseTab";

function PublicCoursesTab({ courses, onEdit, onDelete, onPreview, deletingId }) {
  const publicCourses = courses.filter((c) => c.status === "Public");

  return (
    <BaseCourseTab
      courses={publicCourses}
      onEdit={onEdit}
      onDelete={onDelete}
      onPreview={onPreview}
      deletingId={deletingId}
      emptyMessage="Chưa có khóa học công khai"
      emptyDescription="Các khóa học đã được xuất bản sẽ hiển thị ở đây"
    />
  );
}

export default PublicCoursesTab;