import { useState, useEffect } from "react";
import { categoryAPI } from "@/api/categoryAPI";
import { toast } from "react-toastify";

function CategorySelector({
  onCategoryChange,
  selectedCategoryId,
  selectedSubCategoryId,
  categoryName, // NEW: Accept category name as fallback
  subCategoryName, // NEW: Accept subcategory name as fallback
  disabled = false,
}) {
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedCategoryId, setResolvedCategoryId] = useState(
    selectedCategoryId || 0
  );
  const [resolvedSubCategoryId, setResolvedSubCategoryId] = useState(
    selectedSubCategoryId
  );

  useEffect(() => {
    loadAllCategoriesWithSubcategories();
  }, []);

  // Resolve names to IDs once categories are loaded
  useEffect(() => {
    if (!loading && categories.length > 0 && categoryMap) {
      let newCategoryId = selectedCategoryId || 0;
      let newSubCategoryId = selectedSubCategoryId;

      if (categoryName && !selectedCategoryId) {
        const foundCategory = categories.find(
          (cat) => cat.name === categoryName && cat.isActive
        );
        if (foundCategory) {
          newCategoryId = foundCategory.id;
        }
      }

      if (subCategoryName && !selectedSubCategoryId && newCategoryId) {
        const subs = categoryMap[newCategoryId]?.subCategories || [];
        const foundSub = subs.find((sub) => sub.name === subCategoryName);
        if (foundSub) {
          newSubCategoryId = foundSub.id;
        }
      }

      setResolvedCategoryId(newCategoryId);
      setResolvedSubCategoryId(newSubCategoryId);
    }
  }, [
    loading,
    categories,
    categoryMap,
    selectedCategoryId,
    selectedSubCategoryId,
    categoryName,
    subCategoryName,
  ]);

  useEffect(() => {
    if (resolvedCategoryId && categoryMap[resolvedCategoryId]) {
      const subs = categoryMap[resolvedCategoryId]?.subCategories || [];
      setSubCategories(subs.filter((s) => s.isActive));
    } else {
      setSubCategories([]);
    }
  }, [resolvedCategoryId, categoryMap]);

  const loadAllCategoriesWithSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryAPI.getAllCategories();
      const cats = response.data.data || [];

      if (cats.length === 0) {
        throw new Error("Không tải được danh mục");
      }

      setCategories(cats);

      const newCategoryMap = {};
      for (const cat of cats) {
        if (cat.isActive) {
          try {
            const subResponse = await categoryAPI.getCategoryWithSubcategories(
              cat.id
            );
            const categoryData = subResponse.data.data;
            if (categoryData && categoryData.subCategories) {
              newCategoryMap[cat.id] = {
                ...cat,
                subCategories: categoryData.subCategories.filter(
                  (s) => s.isActive
                ),
              };
            }
          } catch (err) {
            newCategoryMap[cat.id] = { ...cat, subCategories: [] };
          }
        }
      }

      setCategoryMap(newCategoryMap);
    } catch (error) {
      const errorMsg = error.message || "Lỗi khi tải danh mục";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);

    if (!categoryId) {
      setSubCategories([]);
      setResolvedCategoryId(0);
      setResolvedSubCategoryId(undefined);
      onCategoryChange(0, undefined);
      return;
    }

    const subs = categoryMap[categoryId]?.subCategories || [];
    setSubCategories(subs);
    setResolvedCategoryId(categoryId);
    setResolvedSubCategoryId(undefined);
    onCategoryChange(categoryId, undefined);
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = parseInt(e.target.value);
    setResolvedSubCategoryId(subCategoryId || undefined);
    onCategoryChange(resolvedCategoryId, subCategoryId || undefined);
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
          value={resolvedCategoryId ? String(resolvedCategoryId) : ""}
          disabled={loading || disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100 transition-all"
        >
          <option value="">
            {loading
              ? "⏳ Đang tải..."
              : categories.length === 0
              ? "❌ Không có danh mục"
              : "-- Chọn danh mục --"}
          </option>
          {categories
            .filter((cat) => cat.isActive)
            .map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>}
      </div>

      {!loading && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Danh mục con {subCategories.length === 0 && "(Không có sẵn)"}
          </label>
          <select
            onChange={handleSubCategoryChange}
            value={resolvedSubCategoryId ? String(resolvedSubCategoryId) : ""}
            disabled={disabled || subCategories.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100 transition-all"
          >
            <option value="">
              {subCategories.length === 0
                ? "-- Chọn danh mục trước --"
                : "-- Chọn danh mục con --"}
            </option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={String(subCategory.id)}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          <span className="text-sm text-gray-600">⏳ Đang tải danh mục...</span>
        </div>
      )}
    </div>
  );
}

export default CategorySelector;
