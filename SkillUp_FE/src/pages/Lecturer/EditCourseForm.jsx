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
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

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
      setHasImageChanged(false);
      setRemoveCurrentImage(false);
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
      setHasImageChanged(true);
      setRemoveCurrentImage(false);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // FIX: Remove current image function
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
    setRemoveCurrentImage(true);
    setHasImageChanged(true);
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
        toast.success("Khóa học đã được cập nhật thành công");
        onClose();
        onSuccess();
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật khóa học");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error("Lỗi 400: Vui lòng kiểm tra thông tin nhập vào");
      } else {
        toast.error("Lỗi khi cập nhật khóa học. Vui lòng thử lại.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-2 border-blue-200 shadow-2xl animate-in fade-in zoom-in">
          <CardHeader className="bg-blue-50 sticky top-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">✏️ Chỉnh sửa khóa học</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <CardDescription>
              Cập nhật thông tin chi tiết của khóa học.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 max-h-[70vh] overflow-y-auto">
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

              {/* Category Selection */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <CategorySelector
                  onCategoryChange={handleCategoryChange}
                  selectedCategoryId={formData.categoryId}
                  selectedSubCategoryId={formData.subCategoryId}
                />

                
              </div>

              {/* Image Upload */}
              <div>
                <div className="space-y-4">
                  {previewImage && !removeCurrentImage ? (
                    <div className="relative inline-block">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 w-48 object-cover rounded-lg border-2 border-blue-300"
                        crossOrigin="anonymous"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Xóa ảnh"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : null}

                  {removeCurrentImage && (
                    <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                      <span className="text-red-600 font-semibold">
                        ⚠️ Ảnh hiện tại sẽ bị xóa
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveCurrentImage(false);
                          setPreviewImage(course?.image || null);
                        }}
                        className="ml-auto text-sm px-3 py-1 bg-red-200 hover:bg-red-300 rounded transition-colors"
                      >
                        Hoàn tác
                      </button>
                    </div>
                  )}

                  {!removeCurrentImage && (
                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>
                        {formData.image ? "Ảnh được chọn" : "Chọn ảnh mới"}
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
              </div>

              {/* Action Buttons - Sticky at bottom */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <Button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all"
                >
                  {updating ? "⏳ Đang cập nhật..." : "Cập nhật khóa học"}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 bg-red hover:bg-gray-50 transition-all"
                >
                  ❌ Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default EditCourseForm;
