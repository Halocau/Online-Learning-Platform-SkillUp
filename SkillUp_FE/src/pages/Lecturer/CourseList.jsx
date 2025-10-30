import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CourseCardLecture from "./components/CourseCardLecture";


function CourseList({ courses, loading, onRefresh, onCreateClick, onEdit }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (courseId) => {
    toast.info("👁️ Chức năng xem chi tiết sẽ được cập nhật");
  };

  const handleEdit = (courseId) => {
    const courseToEdit = courses.find((c) => c.id === courseId);
    if (courseToEdit && onEdit) {
      onEdit(courseId, courseToEdit);
    } else {
      toast.error("❌ Không tìm thấy thông tin khóa học");
    }
  };

  // FIX: Improved delete handling with proper state management
  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa khóa học này không?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      console.log("🗑️ Deleting course:", courseId);
      
      const response = await courseAPI.deleteCourse(courseId);
      console.log("✅ Delete response:", response.data);

      // FIX: Check for both code === 200 and data is array
      if (response.data.code === 200) {
        toast.success("Khóa học đã được xóa thành công ✅");
        console.log("✅ Course deleted successfully");
        setTimeout(() => {
          onRefresh();
        }, 500);
      } else {
        console.error("❌ Delete failed:", response.data.message);
        toast.error(response.data.message || "Lỗi khi xóa khóa học");
        setDeletingId(null);
      }
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Lỗi khi xóa khóa học");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Lỗi kết nối với máy chủ");
      } else {
        console.error("Error:", error.message);
        toast.error("Lỗi khi xóa khóa học. Vui lòng thử lại.");
      }
      
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "Không tìm thấy khóa học" : "Chưa có khóa học nào"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Bắt đầu tạo khóa học đầu tiên của bạn"}
          </p>
          {!searchTerm && (
            <Button
              onClick={onCreateClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              Không tìm thấy khóa học phù hợp với "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseCardLecture
              key={course.id}
              course={course}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;