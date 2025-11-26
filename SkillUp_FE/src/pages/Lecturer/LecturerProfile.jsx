import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Users, BookOpen, Award, MapPin, Briefcase } from "lucide-react";
import { lecturerAPI } from "@/api/lecturerAPI";
import { Card, CardContent } from "@/components/ui/card";

export default function LecturerProfile() {
  const { accountId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await lecturerAPI.getLecturerPublicProfile(accountId);

        if (response.data?.code === 200 && response.data?.data?.[0]) {
          setProfile(response.data.data[0]);
        } else {
          throw new Error(response.data?.message || "Không thể tải thông tin giảng viên");
        }
      } catch (err) {
        console.error("Error fetching lecturer profile:", err);
        setError(err.message || "Không thể tải thông tin giảng viên");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchProfile();
    }
  }, [accountId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "Không tìm thấy giảng viên"}
          </h2>
          <Link to="/" className="text-[#FFD54F] hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean & Modern */}
      <div className="bg-[#1c1d1f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-xl">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFD54F] to-[#FFC107] text-5xl font-bold text-gray-900">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {profile.fullName}
              </h1>
              
              {profile.title && (
                <p className="text-lg md:text-xl text-gray-300 mb-3">{profile.title}</p>
              )}

              {profile.profession && (
                <div className="flex items-center gap-2 text-gray-300 mb-6">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-base">{profile.profession}</span>
                </div>
              )}

              {/* Stats - Horizontal */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{profile.totalStudents.toLocaleString()}</span>
                  <span className="text-gray-400">học viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{profile.totalCourses}</span>
                  <span className="text-gray-400">khóa học</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FFD54F] fill-[#FFD54F]" />
                  <span className="font-medium">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">đánh giá</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        {profile.description && (
          <section className="mb-12 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Giới thiệu
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>
          </section>
        )}

        {/* Courses Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Các khóa học của tôi ({profile.courses.length})
            </h2>
            <p className="text-gray-600">
              Khám phá các khóa học do {profile.fullName.split(" ").pop()} giảng dạy
            </p>
          </div>

          {profile.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {profile.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group block"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x225?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-[#5624d0] transition-colors min-h-[3rem]">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        {course.rating !== null && (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-orange-600">
                              {course.rating.toFixed(1)}
                            </span>
                            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                          </div>
                        )}
                        {course.enrollmentCount > 0 && (
                          <span className="text-gray-500">
                            ({course.enrollmentCount.toLocaleString()})
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {course.price !== null && course.price > 0 ? (
                          <div className="text-lg font-bold text-gray-900">
                            {course.price.toLocaleString('vi-VN')}₫
                          </div>
                        ) : (
                          <div className="text-base font-bold text-gray-900">
                            Miễn phí
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">Giảng viên chưa có khóa học nào</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
