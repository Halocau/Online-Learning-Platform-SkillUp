import { useState, useEffect } from "react";
import { Upload, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CategorySelector from "../../components/CategorySelector";


function CourseLandingPageTab({ course, courseId, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 0,
    subCategoryId: undefined,
    image: null,
  });

  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        categoryId: course.categoryId || 0,
        subCategoryId: course.subCategoryId || undefined,
        image: null,
      });
      setPreviewImage(course.image || null);
      setRemoveCurrentImage(false);
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setRemoveCurrentImage(false);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
    setRemoveCurrentImage(true);
  };

  const handleCategoryChange = (categoryId, subCategoryId) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId || 0,
      subCategoryId: subCategoryId || undefined,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setUpdating(true);
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);

      if (formData.categoryId > 0) {
        form.append("categoryId", formData.categoryId.toString());
      }
      if (formData.subCategoryId) {
        form.append("subCategoryId", formData.subCategoryId.toString());
      }
      if (removeCurrentImage) {
        form.append("removeImage", "true");
      } else if (formData.image) {
        form.append("image", formData.image);
      }

      const response = await courseAPI.updateCourse(courseId, form);
      if (response.data.code === 200) {
        toast.success("Cập nhật thành công");
        onUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-1">Thông tin khóa học</h2>
          <p className="text-sm text-gray-600 mb-6">
            Thông tin hiển thị công khai
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên khóa học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: React từ cơ bản đến nâng cao"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về khóa học..."
                rows="5"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Category */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <CategorySelector
                onCategoryChange={handleCategoryChange}
                selectedCategoryId={formData.categoryId}
                selectedSubCategoryId={formData.subCategoryId}
                categoryName={course?.categoryName}
                subCategoryName={course?.subCategoryName}
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Ảnh</label>
              {previewImage && !removeCurrentImage ? (
                <div className="relative inline-block mb-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-40 w-64 object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              {removeCurrentImage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3 flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    Ảnh sẽ bị xóa khi lưu
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveCurrentImage(false);
                      setPreviewImage(course?.image || null);
                    }}
                    className="text-sm px-3 py-1 bg-red-200 hover:bg-red-300 rounded"
                  >
                    Hoàn tác
                  </button>
                </div>
              )}

              {!removeCurrentImage && (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.image ? "Ảnh đã chọn" : "Chọn ảnh"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseLandingPageTab;
