import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { axiosInstance } from "@/config/api";
import { toast } from "react-toastify";
import { Star, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoryAPI } from "@/api/categoryAPI";
import CourseCard from "../Home/components/CourseCard";

function CoursesByCategory() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcategoryId = searchParams.get("subcategory");

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [sortBy, setSortBy] = useState("popular");

  // Filter states
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    ratings: true,
    subcategory: true,
  });

  useEffect(() => {
    fetchCategoryPage();
  }, [categoryId]);

  useEffect(() => {
    filterCourses();
  }, [subcategoryId, allCourses, selectedRating, selectedSubcategory, sortBy]);

  const fetchCategoryPage = async () => {
    try {
      setLoading(true);

      // Fetch category page data
      const pageResponse = await axiosInstance.get(
        `/CategoryPage/${categoryId}/page`
      );

      if (pageResponse.data.code === 200) {
        const pageData = pageResponse.data.data[0];

        setCategory({
          id: pageData.mainCategory?.id,
          name: pageData.mainCategory?.name,
          description: pageData.mainCategory?.description || "",
        });

        setAllCourses(pageData.courses || []);
      }

      // Fetch subcategories using categoryAPI
      const subResponse = await categoryAPI.getCategoryWithSubcategories(
        categoryId
      );
      if (subResponse.data.code === 200) {
        setSubcategories(subResponse.data.data[0]?.subCategories || []);
      }
    } catch (error) {
      console.error("Fetch category page error:", error);
      if (error.response?.status === 404) {
        toast.error("Không tìm thấy danh mục");
      } else {
        toast.error("Không thể tải thông tin danh mục");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...allCourses];

    // Filter by URL subcategory parameter
    if (subcategoryId) {
      const subId = parseInt(subcategoryId);
      filtered = filtered.filter((course) => course.subCategoryId === subId);
    }

    // Filter by selected subcategory from sidebar
    if (selectedSubcategory) {
      filtered = filtered.filter(
        (course) => course.subCategoryId === selectedSubcategory
      );
    }

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter((course) => course.rating >= selectedRating);
    }

    // Sort courses
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "newest":
          // If you have createdAt field, use it. Otherwise, sort by ID
          return b.id - a.id;
        case "popular":
        default:
          return b.enrollmentCount - a.enrollmentCount;
      }
    });

    setDisplayedCourses(sorted);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubcategoryFilter = (subId) => {
    if (selectedSubcategory === subId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subId);
    }
  };

  const handleRatingFilter = (rating) => {
    if (selectedRating === rating) {
      setSelectedRating(null);
    } else {
      setSelectedRating(rating);
    }
  };

  const clearAllFilters = () => {
    setSelectedRating(null);
    setSelectedSubcategory(null);
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedRating || selectedSubcategory || subcategoryId;

  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFD54F] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy danh mục
          </h3>
          <Link to="/">
            <Button className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Improved spacing */}
      <div className="border-b bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-30 py-30 lg:py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {category.name}
          </h1>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-3">
            Bắt đầu ngay với các khóa học trong danh mục {category.name}
          </h2>
          <p className="text-gray-600 text-base lg:text-lg max-w-3xl">
            {category.description ||
              "Tìm các khóa học chất lượng cao để nâng cao kỹ năng của bạn."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-30 sm:px-30 lg:px-30 py-20 lg:py-12">
        <div className="flex gap-8 lg:gap-20">
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6">
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="w-full mb-6 text-sm font-medium"
                >
                  Đặt lại bộ lọc
                </Button>
              )}

              {/* Ratings Filter */}
              <div className="border-b pb-6 mb-6">
                <button
                  onClick={() => toggleSection("ratings")}
                  className="w-full flex items-center justify-between py-2 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <span className="text-base">Đánh giá</span>
                  {openSections.ratings ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {openSections.ratings && (
                  <div className="mt-4 space-y-3">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors py-1"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={selectedRating === rating}
                          onChange={() => handleRatingFilter(rating)}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(rating)
                                    ? "fill-orange-400 text-orange-400"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-700 font-medium">
                            {rating} và cao hơn
                          </span>
                          <span className="text-gray-500">
                            (
                            {
                              allCourses.filter((c) => c.rating >= rating)
                                .length
                            }
                            )
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="border-b pb-6 mb-6">
                  <button
                    onClick={() => toggleSection("subcategory")}
                    className="w-full flex items-center justify-between py-2 font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-base">Danh mục con</span>
                    {openSections.subcategory ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {openSections.subcategory && (
                    <div className="mt-4 space-y-3">
                      {subcategories.map((subcat) => (
                        <label
                          key={subcat.id}
                          className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors py-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategory === subcat.id}
                            onChange={() => handleSubcategoryFilter(subcat.id)}
                            className="w-4 h-4 accent-purple-600"
                          />
                          <span className="text-sm text-gray-700 font-medium flex-1">
                            {subcat.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {
                              allCourses.filter(
                                (c) => c.subCategoryId === subcat.id
                              ).length
                            }
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Right Content - Courses with better spacing */}
          <main className="flex-1 min-w-0">
            {/* Results count and sort - Improved */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">
                    Sắp xếp theo:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/50 transition-colors"
                  >
                    <option value="popular">Nổi bật nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="newest">Mới nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course Grid - Better spacing */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : displayedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card className="p-16 text-center border-2 border-dashed">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Không tìm thấy khóa học
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Thử điều chỉnh bộ lọc của bạn để xem thêm kết quả
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold px-6"
                >
                  Đặt lại bộ lọc
                </Button>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CoursesByCategory;
