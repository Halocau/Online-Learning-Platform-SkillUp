import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { axiosInstance } from '@/config/api';
import { toast } from 'react-toastify';
import { Star, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CoursesByCategory() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcategoryId = searchParams.get('subcategory');

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);

  useEffect(() => {
    fetchCategoryPage();
  }, [categoryId]);

  useEffect(() => {
    filterCourses();
  }, [subcategoryId, allCourses]);

  const fetchCategoryPage = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(`/CategoryPage/${categoryId}/page`);
      
      if (response.data.code === 200) {
        const pageData = response.data.data[0];
        
        setCategory({
          id: pageData.mainCategory?.id,
          name: pageData.mainCategory?.name,
          description: pageData.mainCategory?.description || ''
        });
        
        setSubcategories(pageData.subCategories || []);
        setAllCourses(pageData.courses || []);
      }
    } catch (error) {
      console.error('Fetch category page error:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy danh mục');
      } else {
        toast.error('Không thể tải thông tin danh mục');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    if (!subcategoryId) {
      setDisplayedCourses(allCourses);
    } else {
      const subId = parseInt(subcategoryId);
      const filtered = allCourses.filter(
        course => course.subCategoryId === subId
      );
      setDisplayedCourses(filtered);
    }
  };

  const handleSubcategorySelect = (subcatId) => {
    if (subcatId) {
      setSearchParams({ subcategory: subcatId });
    } else {
      setSearchParams({});
    }
  };

  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không tìm thấy danh mục
          </h3>
          <Link to="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleSubcategorySelect(null)}
              className={`px-4 py-3 whitespace-nowrap text-sm font-semibold transition-colors border-b-2 ${
                !subcategoryId
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>

            {subcategories.map((subcat) => {
              return (
                <button
                  key={subcat.id}
                  onClick={() => handleSubcategorySelect(subcat.id)}
                  className={`px-4 py-3 whitespace-nowrap text-sm font-semibold transition-colors border-b-2 ${
                    parseInt(subcategoryId) === subcat.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {subcat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Các khóa học để bạn bắt đầu
          </h2>
          <p className="text-base text-gray-700">
            {category.description || `Khám phá các khóa học do các chuyên gia giảng kinh nghiệm trong ngành giảng dạy.`}
          </p>
        </div>

        <div className="flex items-center gap-6 mb-6 border-b border-gray-300">
          <button className="pb-2 text-sm font-bold border-b-2 border-gray-900 text-gray-900">
            Phổ biến nhất
          </button>
          <button className="pb-2 text-sm font-bold border-b-2 border-transparent text-gray-700 hover:text-gray-900">
            Mới
          </button>
          <button className="pb-2 text-sm font-bold border-b-2 border-transparent text-gray-700 hover:text-gray-900">
            Thịnh hành
          </button>
        </div>
        <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex gap-4 border border-gray-200 p-4 animate-pulse">
                    <div className="w-64 h-36 bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedCourses.length > 0 ? (
              <div className="space-y-4">
                {displayedCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="group"
                  >
                    <div className="flex gap-4 border border-gray-200 hover:shadow-lg transition-shadow p-2">
                      <div className="relative w-64 h-36 flex-shrink-0">
                        <img
                          src={course.image || 'https://via.placeholder.com/400x225?text=Course'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {course.enrollmentCount > 100 && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 text-xs font-bold">
                            Best Seller
                          </div>
                        )}
                      </div>

                      <div className="flex-1 py-1">
                        <h3 className="font-bold text-base mb-1 line-clamp-2 group-hover:text-purple-700">
                          {course.title}
                        </h3>

                        <p className="text-xs text-gray-600 mb-2">
                          {course.lecturerName}
                        </p>

                        <div className="flex items-center gap-2 mb-1">
                          {course.rating > 0 && (
                            <>
                              <span className="font-bold text-orange-600 text-sm">{course.rating.toFixed(1)}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(course.rating)
                                        ? 'fill-orange-400 text-orange-400'
                                        : 'fill-gray-300 text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-600 text-xs">({course.enrollmentCount})</span>
                            </>
                          )}
                        </div>

                        <div className="mt-2">
                          <span className="text-lg font-bold text-gray-900">
                            {course.price === 0 
                              ? 'Miễn phí' 
                              : `${course.price.toLocaleString('vi-VN')} ₫`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chưa có khóa học
                </h3>
                <p className="text-gray-500 mb-6">
                  {subcategoryId
                    ? 'Không tìm thấy khóa học nào trong lĩnh vực này.'
                    : 'Không có khóa học nào trong danh mục này.'}
                </p>
                {subcategoryId && (
                  <Button
                    onClick={() => handleSubcategorySelect(null)}
                    variant="outline"
                  >
                    Xem tất cả khóa học
                  </Button>
                )}
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}

export default CoursesByCategory;
