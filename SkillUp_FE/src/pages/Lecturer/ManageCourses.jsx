import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Eye, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });

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
      console.error("Error loading courses:", error);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả khóa học");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Vui lòng nhập giá khóa học hợp lệ");
      return;
    }
    if (!formData.category.trim()) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    try {
      setCreating(true);

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("price", parseFloat(formData.price));
      form.append("category", formData.category);

      if (formData.image) {
        form.append("image", formData.image);
      }

      const response = await courseAPI.createCourse(form);

      if (response.data.code === 200) {
        toast.success("Khóa học đã được tạo thành công ✅");

        setFormData({
          title: "",
          description: "",
          price: "",
          category: "",
          image: null,
        });

        setShowCreateForm(false);
        await loadCourses();
      } else {
        toast.error(response.data.message || "Lỗi khi tạo khóa học");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Lỗi khi tạo khóa học. Vui lòng thử lại.");
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (courseId) => {
    toast.info("Chức năng chỉnh sửa sẽ được cập nhật!");
  };

  /**
   * Placeholder for delete
   */
  const handleDelete = (courseId) => {
    toast.info("🗑️ Chức năng xóa sẽ được cập nhật");
  };

  /**
   * Placeholder for view
   */
  const handleView = (courseId) => {
    toast.info("👁️ Chức năng xem chi tiết sẽ được cập nhật");
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

      {showCreateForm && (
        <Card className="mb-8 border-2 border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <div className="flex items-center justify-between">
              <CardTitle>Tạo khóa học mới</CardTitle>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CardDescription>
              Điền thông tin chi tiết để tạo một khóa học mới. Khóa học sẽ được
              lưu dưới dạng nháp.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên khóa học *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: React Advanced Patterns"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả khóa học *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về khóa học..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="VD: 99000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="VD: Lập trình"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh khóa học
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400">
                    <Upload className="w-4 h-4" />
                    <span>Chọn ảnh</span>
                    <input
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <span className="text-sm text-gray-600">
                      ✓ {formData.image.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                >
                  {creating ? "⏳ Đang tạo..." : "✅ Tạo khóa học"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  ❌ Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
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
                onClick={() => setShowCreateForm(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo khóa học mới
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {course.status || "Nháp"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Danh mục</p>
                        <p className="font-semibold text-gray-900">
                          {course.category || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Giá</p>
                        <p className="font-semibold text-yellow-600">
                          {course.price?.toLocaleString("vi-VN")} VND
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleView(course.id)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageCourses;
