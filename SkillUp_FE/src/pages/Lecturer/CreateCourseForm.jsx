import { useState } from "react";
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

function CreateCourseForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 0,
    subCategoryId: undefined,
    image: null,
  });

  const [creating, setCreating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
    if (formData.categoryId === 0) {
      toast.error("Vui lòng chọn danh mục");
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
      setCreating(true);

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("categoryId", formData.categoryId.toString());

      if (formData.subCategoryId) {
        form.append("subCategoryId", formData.subCategoryId.toString());
      }

      if (formData.image) {
        form.append("image", formData.image);
      }

      const response = await courseAPI.createDraftCourse(form);

      if (response.data.code === 200) {
        toast.success("Khóa học đã được tạo thành công ✅");

        // Reset form
        setFormData({
          title: "",
          description: "",
          categoryId: 0,
          subCategoryId: undefined,
          image: null,
        });
        setPreviewImage(null);

        onClose();
        onSuccess();
      } else {
        toast.error(response.data.message || "Lỗi khi tạo khóa học");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Lỗi khi tạo khóa học. Vui lòng thử lại.");
      }
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="mb-8 border-2 border-yellow-200 shadow-lg animate-in fade-in slide-in-from-top">
      <CardHeader className="bg-yellow-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">✨ Tạo khóa học mới</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <CardDescription>
          Điền thông tin chi tiết để tạo một khóa học mới. Khóa học sẽ được lưu
          dưới dạng nháp.
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
          </div>

          {/* Category Selection - Now showing both dropdowns */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-3 font-semibold">
              📌 Chọn danh mục:
            </p>
            <CategorySelector
              onCategoryChange={handleCategoryChange}
              selectedCategoryId={formData.categoryId}
              selectedSubCategoryId={formData.subCategoryId}
            />
          </div>

          {/* Image Upload */}
          <div>
            <div className="space-y-4">
              {previewImage && (
                <div className="relative inline-block animate-in fade-in">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-48 object-cover rounded-lg border-2 border-yellow-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Xóa ảnh"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                <Upload className="w-4 h-4" />
                <span>{formData.image ? "✓ Ảnh được chọn" : "Chọn ảnh"}</span>
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
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={creating}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-all transform hover:scale-105"
            >
              {creating ? "⏳ Đang tạo..." : "✅ Tạo khóa học"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 transition-all"
            >
              ❌ Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateCourseForm;
