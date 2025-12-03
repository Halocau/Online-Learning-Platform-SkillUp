import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CreateCourseForm from "./CreateCourseForm";
import CourseList from "./CourseList";

function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCoursesOfLecturer();
      if (response.data.code === 200) {
        setCourses(response.data.data || []);
        toast.success("Đã tải danh sách khóa học");
      } else {
        toast.error(response.data.message || "Lỗi khi tải khóa học");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCourses([]);
        toast.info("Bạn chưa có khóa học nào");
      } else {
        toast.error("Lỗi khi tải danh sách khóa học");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadCourses();
  };

  const handleEditCourse = (courseId) => {
    navigate(`/lecturer/courses/${courseId}`);
  };

  const handlePreviewCourse = (course) => {
    navigate(`/lecturer/courses/${course.id}/preview`, { state: { course } });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      <CreateCourseForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />

      <CourseList
        courses={courses}
        loading={loading}
        onRefresh={loadCourses}
        onCreateClick={() => setShowCreateForm(true)}
        onEdit={handleEditCourse}
        onPreview={handlePreviewCourse}
      />
    </div>
  );
}

export default ManageCourses;