// src/pages/CoursesByCategory.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { axiosInstance } from "@/config/api";
import { toast } from "react-toastify";
import {
  Star,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
} from "lucide-react";
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
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  useEffect(() => {
    fetchCategoryPage();
  }, [categoryId]);

  useEffect(() => {
    filterCourses();
  }, [subcategoryId, allCourses, selectedRating, selectedSubcategory, sortBy]);

  const fetchCategoryPage = async () => {
    try {
      setLoading(true);

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

    if (subcategoryId) {
      const subId = parseInt(subcategoryId);
      filtered = filtered.filter((course) => course.subCategoryId === subId);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(
        (course) => course.subCategoryId === selectedSubcategory
      );
    }

    if (selectedRating) {
      filtered = filtered.filter((course) => course.rating >= selectedRating);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "newest":
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
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFD54F] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#2d334a] font-medium tracking-tight">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#e3f6f5] mx-auto mb-4" />
          <h3 className="text-2xl font-semibold tracking-tight text-[#272343] mb-2">
            Không tìm thấy danh mục
          </h3>
          <Link to="/">
            <Button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFD54F] hover:bg-[#ffca28] text-[#272343] font-semibold tracking-tight px-5 py-2 shadow-sm">
              Về trang chủ
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Category Header */}
      <section className="border-b border-[#272343]/10 bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#272343]/10 bg-[#fffffe]/80 px-3 py-1 text-xs font-medium tracking-tight text-[#2d334a]">
              <BookOpen className="h-3.5 w-3.5 text-[#FFD54F]" />
              <span>Lộ trình theo danh mục</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-[#272343]">
              <span className="relative inline-block">
                {category.name}
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#FFD54F]/80"></span>
              </span>
            </h1>

            <p className="text-base lg:text-lg leading-relaxed text-[#2d334a]">
              {category.description ||
                `Khám phá các khóa học ${category.name} chất lượng cao để nâng cao kỹ năng của bạn.`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-[#fffffe]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-6 space-y-6 rounded-2xl border border-[#272343]/10 bg-[#fdfaf1] p-5">
                {/* Filter Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-tight text-[#2d334a] mb-1">
                      Bộ lọc
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center justify-center rounded-full border border-[#272343]/15 bg-[#fffffe] px-3 py-1.5 text-xs font-medium tracking-tight text-[#272343] hover:bg-[#FFF3CD] transition-colors whitespace-nowrap"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                {/* Rating Filter */}
                <div className="rounded-2xl border border-[#272343]/10 bg-[#fffffe] overflow-hidden">
                  <button
                    onClick={() => toggleSection("ratings")}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold tracking-tight text-[#272343] hover:text-[#FFD54F] transition-colors"
                  >
                    <span>Đánh giá</span>
                    {openSections.ratings ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    )}
                  </button>

                  {openSections.ratings && (
                    <div className="border-t border-[#272343]/10 px-3 py-3 space-y-1">
                      {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-2.5 hover:bg-[#FFF8E1] transition-colors group"
                        >
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating}
                            onChange={() => handleRatingFilter(rating)}
                            className="sr-only"
                          />
                          <span className="relative flex h-5 w-5 items-center justify-center flex-shrink-0">
                            <span
                              className={`h-5 w-5 rounded-full border-2 transition-colors ${
                                selectedRating === rating
                                  ? "border-[#FFD54F] bg-[#FFD54F]/10"
                                  : "border-[#272343]/30 bg-[#fffffe] group-hover:border-[#FFD54F]/50"
                              }`}
                            ></span>
                            {selectedRating === rating && (
                              <span className="absolute h-2.5 w-2.5 rounded-full bg-[#FFD54F]"></span>
                            )}
                          </span>

                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 flex-shrink-0 ${
                                      i < Math.floor(rating)
                                        ? "fill-[#FFD54F] text-[#FFD54F]"
                                        : "fill-[#e5e7eb] text-[#e5e7eb]"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#272343] font-medium">
                                {rating} trở lên
                              </span>
                              <span className="text-xs text-[#6b7280]">
                                (
                                {
                                  allCourses.filter((c) => c.rating >= rating)
                                    .length
                                }
                                )
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subcategory Filter */}
                {subcategories.length > 0 && (
                  <div className="rounded-2xl border border-[#272343]/10 bg-[#fffffe] overflow-hidden">
                    <button
                      onClick={() => toggleSection("subcategory")}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold tracking-tight text-[#272343] hover:text-[#FFD54F] transition-colors"
                    >
                      <span>Danh mục con</span>
                      {openSections.subcategory ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      )}
                    </button>

                    {openSections.subcategory && (
                      <div className="border-t border-[#272343]/10 px-3 py-3 space-y-1">
                        {subcategories.map((subcat) => (
                          <label
                            key={subcat.id}
                            className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-2.5 hover:bg-[#FFF8E1] transition-colors group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubcategory === subcat.id}
                              onChange={() =>
                                handleSubcategoryFilter(subcat.id)
                              }
                              className="sr-only"
                            />
                            <span className="relative flex h-5 w-5 items-center justify-center flex-shrink-0">
                              <span
                                className={`h-5 w-5 rounded-md border-2 transition-colors ${
                                  selectedSubcategory === subcat.id
                                    ? "border-[#FFD54F] bg-[#FFD54F]/10"
                                    : "border-[#272343]/30 bg-[#fffffe] group-hover:border-[#FFD54F]/50"
                                }`}
                              ></span>
                              {selectedSubcategory === subcat.id && (
                                <span className="absolute h-3 w-3 rounded-[4px] bg-[#FFD54F]"></span>
                              )}
                            </span>
                            <span className="text-sm font-medium text-[#272343] flex-1 min-w-0 truncate">
                              {subcat.name}
                            </span>
                            <span className="text-xs rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-[#4b5563] flex-shrink-0">
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

            {/* Main Content - Courses */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Sort + Result Info */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#272343]">
                    {displayedCourses.length} khóa học được tìm thấy
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#4b5563]">
                    Sắp xếp theo
                  </span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-full border border-[#272343]/15 bg-[#fffffe] pl-4 pr-9 py-2 text-sm font-medium text-[#272343] focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/60 hover:border-[#FFD54F]/50 transition-colors cursor-pointer"
                    >
                      <option value="popular">Nổi bật nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#4b5563]">
                    Lọc đang áp dụng:
                  </span>
                  {selectedRating && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD54F]/10 px-3 py-1.5 text-xs font-medium text-[#272343] border border-[#FFD54F]/20">
                      <Star className="h-3 w-3 fill-[#FFD54F] text-[#FFD54F]" />
                      {selectedRating}+ sao
                      <button
                        onClick={() => setSelectedRating(null)}
                        className="hover:text-[#272343]/70 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedSubcategory && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f6f5] px-3 py-1.5 text-xs font-medium text-[#272343]">
                      {
                        subcategories.find((s) => s.id === selectedSubcategory)
                          ?.name
                      }
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className="hover:text-[#272343]/70 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Course Grid */}
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="animate-pulse">
                      <div className="aspect-video w-full bg-[#e3f6f5] rounded-2xl mb-3"></div>
                      <div className="h-4 bg-[#e3f6f5] rounded-lg mb-2"></div>
                      <div className="h-3 bg-[#e3f6f5] rounded-lg w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : displayedCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-2 border-dashed border-[#272343]/15 bg-[#fffffe] p-16 text-center">
                  <BookOpen className="w-20 h-20 text-[#e3f6f5] mx-auto mb-6" />
                  <h3 className="text-xl font-semibold tracking-tight text-[#272343] mb-3">
                    Không tìm thấy khóa học
                  </h3>
                  <p className="text-[#2d334a] mb-8 max-w-md mx-auto">
                    Thử điều chỉnh bộ lọc của bạn để xem thêm kết quả
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 rounded-full bg-[#FFD54F] hover:bg-[#ffca28] text-[#272343] font-semibold tracking-tight px-6 shadow-sm"
                  >
                    Đặt lại bộ lọc
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CoursesByCategory;
