import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CategorySelector from "./components/CategorySelector";

function EditCourseForm({ courseId, course, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 0,
    subCategoryId: undefined,
    image: null,
  });

  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize form with course data
  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        categoryId: course.categoryId || 0,
        subCategoryId: course.subCategoryId || undefined,
        image: null,
      });
      setPreviewImage(course.image || null);
    }
  }, [course, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCategoryChange = (categoryId, subCategoryId) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subCategoryId: subCategoryId || undefined,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả khóa học");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setUpdating(true);

      

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      
      
      if (formData.categoryId > 0) {
        form.append("categoryId", formData.categoryId.toString());

      } else {
        console.log("⚠️ CategoryId is 0, skipping to avoid 400 error");
      }

      if (formData.subCategoryId) {
        form.append("subCategoryId", formData.subCategoryId.toString());
        
      }

      if (formData.image) {
        form.append("image", formData.image);
       
      }

      const response = await courseAPI.updateCourse(courseId, form);
      

      if (response.data.code === 200) {
        toast.success("Khóa học đã được cập nhật thành công ✅");
        onClose();
        onSuccess();
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật khóa học");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error("❌ Lỗi 400: Vui lòng kiểm tra thông tin nhập vào");
      } else {
        toast.error("Lỗi khi cập nhật khóa học. Vui lòng thử lại.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="mb-8 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle>Chỉnh sửa khóa học</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <CardDescription>
          Cập nhật thông tin chi tiết của khóa học.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Selection (Optional for update) */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <CategorySelector 
              onCategoryChange={handleCategoryChange}
              selectedCategoryId={formData.categoryId}
              selectedSubCategoryId={formData.subCategoryId}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh khóa học
            </label>
            <div className="space-y-4">
              {previewImage && (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-48 object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(course?.image || null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh mới</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={updating}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              {updating ? "⏳ Đang cập nhật..." : "✅ Cập nhật khóa học"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              ❌ Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditCourseForm;