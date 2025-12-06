// src/pages/LecturerProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { lecturerAPI } from "@/api/lecturerAPI";
import CourseCard from "../Home/components/CourseCard";

export default function LecturerProfile() {
  const { accountId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;

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
          throw new Error(
            response.data?.message || "Không thể tải thông tin giảng viên"
          );
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

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses =
    profile?.courses.slice(indexOfFirstCourse, indexOfLastCourse) || [];
  const totalPages = Math.ceil((profile?.courses.length || 0) / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-[#272343]/10 rounded-2xl"></div>
            <div className="h-40 bg-[#272343]/10 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-[#272343]/10 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#ffd803]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[#272343]" />
          </div>
          <h2 className="text-2xl font-bold text-[#272343] mb-2">
            {error || "Không tìm thấy giảng viên"}
          </h2>
          <Link
            to="/"
            className="text-[#ffd803] hover:text-[#FFD54F] font-medium"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Hero Section with Theme Colors */}
      <div className="relative bg-gradient-to-br from-[#2d2d2d]  to-[#1a1a1a] text-white overflow-hidden">
        {/* Decorative elements with theme colors */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#ffd803] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#FFD54F] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#e3f6f5] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar with Badge */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-[#ffd803]/30">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ffd803] to-[#FFD54F] text-5xl font-bold text-[#272343]">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {profile.averageRating >= 4.5 && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#ffd803] to-[#FFD54F] text-[#272343] px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold">Đánh giá cao</span>
                </div>
              )}
            </div>

            {/* Instructor Info */}
            <div className="flex-1">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-[#ffd803]/20 text-[#ffd803] text-xs font-semibold rounded-full border border-[#ffd803]/30">
                  GIẢNG VIÊN
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                {profile.fullName}
              </h1>

              {profile.title && (
                <p className="text-lg md:text-xl text-gray-300 mb-3 font-medium">
                  {profile.title}
                </p>
              )}

              {profile.profession && (
                <div className="flex items-center gap-2 text-gray-300 mb-6">
                  <Briefcase className="w-5 h-5 text-[#ffd803]" />
                  <span className="text-base">{profile.profession}</span>
                </div>
              )}

              {/* Stats Grid with Theme Colors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#ffd803] mb-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">
                    {profile.totalStudents.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Học viên</div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#e3f6f5] mb-1">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">
                    {profile.totalCourses}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Khóa học</div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#FFD54F] mb-1">
                    <Star className="w-5 h-5 fill-[#FFD54F]" />
                  </div>
                  <div className="text-2xl font-bold">
                    {profile.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Đánh giá</div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">
                    {profile.courses.length > 0
                      ? Math.round(
                          profile.totalStudents / profile.courses.length
                        )
                      : 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">TB/Khóa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Theme Gradient */}
      <div className="bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* About Section */}
          {profile.description && (
            <section className="mb-12">
              <div className="bg-[#fffffe] rounded-2xl border border-[#272343]/10 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-[#272343] mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#ffd803] to-[#FFD54F] rounded-full"></div>
                  Giới thiệu
                </h2>
                <div className="prose max-w-none">
                  <p className="text-[#2d334a] text-base leading-relaxed whitespace-pre-wrap">
                    {profile.description}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Courses Section */}
          <section>
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#272343] mb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#ffd803] to-[#FFD54F] rounded-full"></div>
                    Khóa học của tôi
                  </h2>
                  <p className="text-[#2d334a]">
                    {profile.courses.length} khóa học • Trang {currentPage} /{" "}
                    {totalPages || 1}
                  </p>
                </div>

                {/* Course Count Badge */}
                <div className="bg-gradient-to-r from-[#fff8e1] to-[#FFD54F]/20 border border-[#ffd803]/30 rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-[#272343]">
                    {profile.courses.length} khóa học có sẵn
                  </span>
                </div>
              </div>
            </div>

            {profile.courses.length > 0 ? (
              <>
                {/* Courses Grid - Using CourseCard Component */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination with Theme Colors */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-[#272343]/20 hover:bg-[#fff8e1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#272343]" />
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`min-w-[40px] h-10 rounded-xl font-medium transition-all ${
                                currentPage === pageNumber
                                  ? "bg-gradient-to-r from-[#ffd803] to-[#FFD54F] text-[#272343] shadow-md"
                                  : "border border-[#272343]/20 hover:bg-[#fff8e1] text-[#272343]"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="flex items-center px-2 text-[#2d334a]"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-[#272343]/20 hover:bg-[#fff8e1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#272343]" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#fffffe] border border-[#272343]/10 rounded-2xl text-center py-16">
                <div className="w-20 h-20 bg-[#e3f6f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-[#272343]/50" />
                </div>
                <p className="text-[#272343] text-lg font-medium">
                  Giảng viên chưa có khóa học nào
                </p>
                <p className="text-[#2d334a] text-sm mt-2">
                  Hãy quay lại sau để khám phá các khóa học mới
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
