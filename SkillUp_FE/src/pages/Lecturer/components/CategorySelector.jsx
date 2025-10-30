import { useState, useEffect } from "react";
import { categoryAPI } from "@/api/categoryAPI";
import { toast } from "react-toastify";

function CategorySelector({
  onCategoryChange,
  selectedCategoryId,
  selectedSubCategoryId,
  disabled = false,
}) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryAPI.getAllCategories();

      const cats = response.data.data || [];

      if (cats.length > 0) {

        setCategories(cats);
      } else {
        const errorMsg = "Không thể tải danh mục";

        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {

      const errorMsg = error.response?.data?.message || "Lỗi khi tải danh mục";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = parseInt(e.target.value);


    if (!categoryId) {
      setSubCategories([]);
      onCategoryChange(0);
      return;
    }

    try {
      const response = await categoryAPI.getCategoryWithSubcategories(
        categoryId
      );

      
      const categoryData = response.data.data;
      if (
        categoryData &&
        categoryData.subCategories &&
        Array.isArray(categoryData.subCategories)
      ) {
        const active =
          categoryData.subCategories.filter((sc) => sc.isActive) || [];

        setSubCategories(active);
        onCategoryChange(categoryId, undefined);
      } else {

        setSubCategories([]);
        onCategoryChange(categoryId, undefined);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh mục con");
      setSubCategories([]);
    }
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = parseInt(e.target.value);
    const categoryId = parseInt(
      document.getElementById("category-select")?.value || "0"
    );


    if (categoryId) {
      onCategoryChange(categoryId, subCategoryId || undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Danh mục *
        </label>
        <select
          id="category-select"
          onChange={handleCategoryChange}
          value={selectedCategoryId || ""}
          disabled={loading || disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
        >
          <option value="">
            {loading
              ? "Đang tải..."
              : categories.length === 0
              ? "Không có danh mục"
              : "-- Chọn danh mục --"}
          </option>
          {categories
            .filter((cat) => cat.isActive)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Danh mục con
          </label>
          <select
            onChange={handleSubCategoryChange}
            value={selectedSubCategoryId || ""}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
          >
            <option value="">-- Chọn danh mục con --</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default CategorySelector;
