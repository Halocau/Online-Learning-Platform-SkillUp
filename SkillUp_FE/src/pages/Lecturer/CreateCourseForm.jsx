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
  // FIX: Add state to track selected category for display
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

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

  // FIX: Better category change handler that tracks the selection
  const handleCategoryChange = (categoryId, subCategoryId) => {
    console.log("📌 Create form - Category changed to:", categoryId, "Subcategory:", subCategoryId);
    
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subCategoryId: subCategoryId || undefined,
    }));

    // FIX: Update display text
    if (categoryId > 0) {
      setSelectedCategoryName(`ID: ${categoryId}`);
    } else {
      setSelectedCategoryName("");
    }
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

      console.log("📝 Creating course with data:", {
        title: formData.title,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        hasImage: !!formData.image,
      });

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
        setSelectedCategoryName("");

        onClose();
        onSuccess();
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

  if (!isOpen) return null;

  return (
    <Card className="mb-8 border-2 border-yellow-200">
      <CardHeader className="bg-yellow-50">
        <div className="flex items-center justify-between">
          <CardTitle>Tạo khóa học mới</CardTitle>
          <button
            onClick={onClose}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">📌 Chọn danh mục:</p>
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
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh</span>
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
              disabled={creating}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              {creating ? "⏳ Đang tạo..." : "✅ Tạo khóa học"}
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

export default CreateCourseForm;