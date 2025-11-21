import { useEffect, useState, useMemo, useCallback } from "react";
import { courseAPI } from "@/api/courseAPI";
import {
    BookOpen,
    TrendingUp,
    Clock,
    Award,
    PlayCircle,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StatCard from "@/components/StudentDashboard/StatCard";
import CourseSkeleton from "@/components/StudentDashboard/CourseSkeleton";
import CourseCardItem from "@/components/StudentDashboard/CourseCardItem";
import ContinueLearningCard from "@/components/StudentDashboard/ContinueLearningCard";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

const COURSES_PER_PAGE = 6;

export default function StudentDashboard() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);

    // Calculate stats from enrolled courses
    const stats = useMemo(() => {
        const totalCourses = enrolledCourses.length;
        const inProgress = totalCourses; // Có thể tính toán dựa trên progress thực tế
        const completed = 0; // Có thể tính toán dựa trên progress thực tế
        const totalHours = totalCourses * 10; // Placeholder

        return {
            totalCourses,
            inProgress,
            completed,
            totalHours,
        };
    }, [enrolledCourses.length]);

    useEffect(() => {
        loadEnrolledCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadEnrolledCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await courseAPI.getStudentEnrolledCourses();

            // API trả về: { code: 200, message: "...", data: [[courses...]] }
            if (response.data && response.data.code === 200 && response.data.data) {
                // data là array of arrays, lấy phần tử đầu tiên (array các courses)
                const courses = Array.isArray(response.data.data[0])
                    ? response.data.data[0]
                    : response.data.data;
                setEnrolledCourses(courses);
            } else {
                throw new Error(response.data?.message || "Không thể tải danh sách khóa học");
            }
        } catch (err) {
            setError(err.message || "Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoized filtered courses
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return enrolledCourses;

        const query = searchQuery.toLowerCase();
        return enrolledCourses.filter((course) =>
            course.title?.toLowerCase().includes(query) ||
            course.lecturerName?.toLowerCase().includes(query)
        );
    }, [enrolledCourses, searchQuery]);

    // Memoized pagination logic
    const pagination = useMemo(() => {
        const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
        const startIndex = currentPage * COURSES_PER_PAGE;
        const endIndex = startIndex + COURSES_PER_PAGE;
        const currentCourses = filteredCourses.slice(startIndex, endIndex);

        return { totalPages, currentCourses };
    }, [filteredCourses, currentPage]);

    // Memoized recent enrollments
    const recentEnrollments = useMemo(() => {
        return enrolledCourses
            .filter(course => course.enrolledAt)
            .sort((a, b) => {
                const dateA = new Date(a.enrolledAt);
                const dateB = new Date(b.enrolledAt);
                return dateB - dateA; // Mới nhất trước
            })
            .slice(0, 5); // Lấy 5 hoạt động gần nhất
    }, [enrolledCourses]);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery]);

    const goToPage = useCallback((page) => {
        if (page >= 0 && page < pagination.totalPages) {
            setCurrentPage(page);
        }
    }, [pagination.totalPages]);

    const goToNext = useCallback(() => {
        if (currentPage < pagination.totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, pagination.totalPages]);

    const goToPrev = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .course-slide {
                    animation: slideIn 0.4s ease-out;
                }
            `}</style>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
                        <p className="text-gray-600 mt-2">
                            Chào mừng trở lại! Dưới đây là tổng quan về quá trình học tập của bạn.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={BookOpen}
                            label="Khóa học đã đăng ký"
                            value={stats.totalCourses}
                            color="bg-blue-500"
                        />
                        <StatCard
                            icon={PlayCircle}
                            label="Đang học"
                            value={stats.inProgress}
                            color="bg-green-500"
                        />
                        <StatCard
                            icon={Award}
                            label="Đã hoàn thành"
                            value={stats.completed}
                            color="bg-yellow-500"
                        />
                        <StatCard
                            icon={Clock}
                            label="Tổng giờ học"
                            value={stats.totalHours}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Enrolled Courses Section */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-3">
                                                Khóa học đã đăng ký
                                                {enrolledCourses.length > 0 && (
                                                    <Link
                                                        to="/my-courses"
                                                        className="text-sm font-medium text-[#FFD54F] hover:text-[#FFC107] transition-colors"
                                                    >
                                                        Xem tất cả
                                                    </Link>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {enrolledCourses.length > 0
                                                    ? `${enrolledCourses.length} khóa học của bạn`
                                                    : "Các khóa học bạn đã đăng ký"}
                                            </CardDescription>
                                        </div>
                                        {enrolledCourses.length > 0 && (
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm khóa học..."
                                                    value={searchQuery}
                                                    onChange={handleSearchChange}
                                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent text-sm"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={handleClearSearch}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        aria-label="Xóa tìm kiếm"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[...Array(6)].map((_, i) => (
                                                <CourseSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-600 text-sm">{error}</p>
                                        </div>
                                    ) : filteredCourses.length === 0 ? (
                                        <div className="text-center py-12">
                                            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-4">
                                                {searchQuery
                                                    ? "Không tìm thấy khóa học nào"
                                                    : "Bạn chưa đăng ký khóa học nào"}
                                            </p>
                                            {searchQuery ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleClearSearch}
                                                    className="mr-2"
                                                >
                                                    Xóa bộ lọc
                                                </Button>
                                            ) : (
                                                <Link to="/">
                                                    <Button className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900">
                                                        Khám phá khóa học
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative min-h-[650px] flex flex-col">
                                            {/* Course Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start flex-grow">
                                                {pagination.currentCourses.map((course, index) => (
                                                    <CourseCardItem
                                                        key={course.id}
                                                        course={course}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>

                                            {/* Pagination Controls - Fixed at bottom */}
                                            <div className="mt-6 flex-shrink-0">
                                                {pagination.totalPages > 1 && (
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        {/* Page Info */}
                                                        <div className="text-sm text-gray-600">
                                                            Trang {currentPage + 1} / {pagination.totalPages}
                                                            <span className="ml-2">
                                                                ({filteredCourses.length} khóa học)
                                                            </span>
                                                        </div>

                                                        {/* Navigation */}
                                                        <div className="flex items-center gap-2">
                                                            {/* Prev Button */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={goToPrev}
                                                                disabled={currentPage === 0}
                                                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                                Trước
                                                            </Button>

                                                            {/* Page Dots */}
                                                            <div className="flex items-center gap-1.5">
                                                                {Array.from({ length: pagination.totalPages }).map((_, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => goToPage(index)}
                                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === index
                                                                            ? "bg-[#FFD54F] w-8"
                                                                            : "bg-gray-300 hover:bg-gray-400"
                                                                            }`}
                                                                        aria-label={`Đi tới trang ${index + 1}`}
                                                                    />
                                                                ))}
                                                            </div>

                                                            {/* Next Button */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={goToNext}
                                                                disabled={currentPage === pagination.totalPages - 1}
                                                                className="disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Sau
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions & Recent Activity */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Thao tác nhanh</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link to="/">
                                        <Button className="w-full bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold justify-start">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Khám phá khóa học
                                        </Button>
                                    </Link>
                                    <Link to="/profile">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Award className="w-4 h-4 mr-2" />
                                            Xem hồ sơ
                                        </Button>
                                    </Link>
                                    <Link to="/ticket">
                                        <Button variant="outline" className="w-full justify-start">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Hỗ trợ
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 text-sm max-h-[400px] overflow-y-auto">
                                        {recentEnrollments.length > 0 ? (
                                            <>
                                                {recentEnrollments.map((course, index) => (
                                                    <div key={course.id || index} className="flex gap-3">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 line-clamp-1">
                                                                Đã đăng ký khóa học
                                                            </p>
                                                            <p className="text-gray-600 line-clamp-2 mt-0.5">
                                                                {course.title || "Khóa học"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {formatTimeAgo(course.enrolledAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {enrolledCourses.length > recentEnrollments.length && (
                                                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                Tiếp tục học tập
                                                            </p>
                                                            <p className="text-gray-600">
                                                                {stats.inProgress} khóa học đang học
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : enrolledCourses.length > 0 ? (
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Tiếp tục học tập
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {stats.inProgress} khóa học đang học
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 text-sm">
                                                Chưa có hoạt động nào
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Continue Learning Section */}
                    {!loading && enrolledCourses.length > 0 && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Tiếp tục học tập</CardTitle>
                                <CardDescription>
                                    Quay lại các khóa học bạn đang học
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {enrolledCourses.slice(0, 3).map((course) => (
                                        <ContinueLearningCard
                                            key={course.id}
                                            course={course}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
