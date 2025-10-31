import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CreateCourseForm from "./CreateCourseForm";
import EditCourseForm from "./EditCourseForm";
import CourseList from "./CourseList";



function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // FIX: Add state for edit form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  /**
   * Load all courses for the lecturer
   */
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


  const handleEditCourse = (courseId, courseData) => {
    setEditingCourseId(courseId);
    setEditingCourse(courseData);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingCourse(null);
    setEditingCourseId(null);
  };


  const handleEditSuccess = () => {
    handleCloseEditForm();
    loadCourses();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-2">
            Tạo, chỉnh sửa và quản lý các khóa học của bạn
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      {/* Create Course Form */}
      <CreateCourseForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* FIX: Add Edit Course Form */}
      <EditCourseForm
        courseId={editingCourseId}
        course={editingCourse}
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
      />

      {/* Courses List */}
      <CourseList
        courses={courses}
        loading={loading}
        onRefresh={loadCourses}
        onCreateClick={() => setShowCreateForm(true)}
        onEdit={handleEditCourse}
      />
    </div>
  );
}

export default ManageCourses;