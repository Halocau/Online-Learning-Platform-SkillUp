import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    PlayCircle,
    Award,
    Clock,
    Search,
    X,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { courseAPI } from "@/api/courseAPI";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StudentDashboard/StatCard";
import CourseCardItem from "@/components/StudentDashboard/CourseCardItem";
import CourseSkeleton from "@/components/StudentDashboard/CourseSkeleton";
import ContinueLearningCard from "@/components/StudentDashboard/ContinueLearningCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

const CONTINUE_PER_PAGE = 3;

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [continuePage, setContinuePage] = useState(0);
    const COURSES_PER_PAGE = 6;

    const loadCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await courseAPI.getStudentEnrolledCourses();

            if (response.data?.code === 200 && response.data?.data) {
                const payload = Array.isArray(response.data.data[0])
                    ? response.data.data[0]
                    : response.data.data;
                
                // Map courseId to id for compatibility
                const mappedCourses = (payload || []).map(course => ({
                    ...course,
                    id: course.courseId || course.id,
                }));
                
                setCourses(mappedCourses);
            } else {
                throw new Error(response.data?.message || "Không thể tải danh sách khóa học");
            }
        } catch (err) {
            setError(err.message || "Không thể tải danh sách khóa học. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const stats = useMemo(() => {
        const total = courses.length;
        const completed = courses.filter(c => c.progressPercentage >= 100).length;
        const inProgress = total - completed;
        const hours = total * 10;
        return {
            totalCourses: total,
            inProgress,
            completed,
            totalHours: hours,
        };
    }, [courses]);

    const sortedCourses = useMemo(() => {
        return courses
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.enrolledAt || b.createdAt || 0) -
                    new Date(a.enrolledAt || a.createdAt || 0)
            );
    }, [courses]);

    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return sortedCourses;
        const q = searchQuery.toLowerCase();
        return sortedCourses.filter(
            (course) =>
                course.title?.toLowerCase().includes(q) ||
                course.lecturerName?.toLowerCase().includes(q)
        );
    }, [sortedCourses, searchQuery]);

    const pagination = useMemo(() => {
        const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE) || 1;
        const safePage = Math.min(currentPage, totalPages - 1);
        const startIndex = safePage * COURSES_PER_PAGE;
        const endIndex = startIndex + COURSES_PER_PAGE;
        const currentCourses = filteredCourses.slice(startIndex, endIndex);
        return {
            totalPages,
            safePage,
            currentCourses,
            totalCourses: filteredCourses.length,
        };
    }, [filteredCourses, currentPage, COURSES_PER_PAGE]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery, filteredCourses.length]);

    useEffect(() => {
        setContinuePage(0);
    }, [courses.length]);

    const recentActivities = useMemo(() => {
        return courses
            .filter((course) => course.enrolledAt)
            .sort(
                (a, b) =>
                    new Date(b.enrolledAt || b.createdAt || 0) -
                    new Date(a.enrolledAt || a.createdAt || 0)
            )
            .slice(0, 6);
    }, [courses]);

    const continuePagination = useMemo(() => {
        const totalPages = Math.ceil(sortedCourses.length / CONTINUE_PER_PAGE) || 1;
        const safePage = Math.min(continuePage, totalPages - 1);
        const startIndex = safePage * CONTINUE_PER_PAGE;
        return {
            totalPages,
            safePage,
            currentCourses: sortedCourses.slice(startIndex, startIndex + CONTINUE_PER_PAGE),
        };
    }, [sortedCourses, continuePage]);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleClearSearch = () => setSearchQuery("");

    const goToPage = (page) => {
        if (page >= 0 && page < pagination.totalPages) {
            setCurrentPage(page);
        }
    };

    const goToPrev = () => {
        if (pagination.safePage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const goToNext = () => {
        if (pagination.safePage < pagination.totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const renderPaginationControls = () => {
        if (!filteredCourses.length || pagination.totalPages <= 1) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <p className="text-sm text-gray-500">
                    Trang {pagination.safePage + 1} / {pagination.totalPages}
                    <span className="ml-2">({pagination.totalCourses} khóa học)</span>
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrev}
                        disabled={pagination.safePage === 0}
                        className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToPage(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === pagination.safePage
                                    ? "bg-yellow-400 w-8"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                aria-label={`Đi tới trang ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={pagination.safePage >= pagination.totalPages - 1}
                        className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderContinuePagination = () => {
        if (continuePagination.totalPages <= 1) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 text-sm text-gray-500">
                <span className="text-center sm:text-left">
                    Trang {continuePagination.safePage + 1} / {continuePagination.totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContinuePage((prev) => Math.max(0, prev - 1))}
                        disabled={continuePagination.safePage === 0}
                        className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: continuePagination.totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setContinuePage(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${continuePagination.safePage === idx
                                    ? "bg-yellow-400 w-6"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setContinuePage((prev) =>
                                Math.min(continuePagination.totalPages - 1, prev + 1)
                            )
                        }
                        disabled={continuePagination.safePage >= continuePagination.totalPages - 1}
                        className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderCoursesGrid = () => (
        <div className="relative min-h-[650px] flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-grow items-start">
                {pagination.currentCourses.map((course, index) => (
                    <CourseCardItem key={course.id} course={course} index={index} />
                ))}
            </div>
            {renderPaginationControls()}
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .course-slide {
                    animation: slideIn 0.45s ease-out;
                }
            `}</style>
            <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="space-y-4 bg-white/80 backdrop-blur-sm border border-amber-100 shadow-lg rounded-3xl p-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-semibold">
                            Lộ trình của bạn
                        </p>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
                                <p className="text-gray-600 mt-1">
                                    Theo dõi tiến độ, tiếp tục học nhanh và nắm bắt hoạt động mới nhất.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={loadCourses} className="hover:bg-gray-100">
                                    Làm mới
                                </Button>
                                <Link to="/student/dashboard">
                                    <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow">
                                        Về bảng điều khiển
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={BookOpen} label="Khóa học đã đăng ký" value={stats.totalCourses} color="bg-blue-500" />
                        <StatCard icon={PlayCircle} label="Đang học" value={stats.inProgress} color="bg-green-500" />
                        <StatCard icon={Award} label="Đã hoàn thành" value={stats.completed} color="bg-yellow-500" />
                        <StatCard icon={Clock} label="Tổng giờ học" value={stats.totalHours} color="bg-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader className="gap-4">
                                    <div className="flex flex-col gap-2">
                                        <CardTitle className="text-2xl">Danh sách khóa học</CardTitle>
                                        <CardDescription>
                                            {filteredCourses.length > 0
                                                ? `${filteredCourses.length} khóa học phù hợp`
                                                : "Tìm kiếm khóa học đã đăng ký"}
                                        </CardDescription>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Tìm kiếm theo tên khóa học hoặc giảng viên..."
                                            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-2xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={handleClearSearch}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                                            {[...Array(4)].map((_, idx) => (
                                                <CourseSkeleton key={idx} />
                                            ))}
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-10 space-y-3">
                                            <BookOpen className="w-12 h-12 text-red-300 mx-auto" />
                                            <p className="text-gray-700">{error}</p>
                                            <Button onClick={loadCourses}>Thử lại</Button>
                                        </div>
                                    ) : filteredCourses.length === 0 ? (
                                        <div className="text-center py-10 space-y-3">
                                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                                            <h3 className="text-lg font-semibold text-gray-900">Bạn chưa có khóa học nào</h3>
                                            <p className="text-gray-600">
                                                Khám phá thêm khóa học để bắt đầu hành trình học tập của bạn.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <Link to="/">
                                                    <Button variant="outline">Khám phá khóa học</Button>
                                                </Link>
                                                <Link to="/news">
                                                    <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                                                        Khóa học nổi bật
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        renderCoursesGrid()
                                    )}
                                </CardContent>
                            </Card>

                            {!!courses.length && (
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <TrendingUp className="w-5 h-5 text-yellow-500" />
                                            Tiếp tục học tập
                                        </CardTitle>
                                        <CardDescription>
                                            Quay lại các khóa học bạn đang học
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                                            {continuePagination.currentCourses.map((course) => (
                                                <ContinueLearningCard key={course.id} course={course} />
                                            ))}
                                            {Array.from({
                                                length: Math.max(
                                                    0,
                                                    3 - continuePagination.currentCourses.length
                                                ),
                                            }).map((_, idx) => (
                                                <div key={`placeholder-${idx}`} className="hidden md:block" />
                                            ))}
                                        </div>
                                        {renderContinuePagination()}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card className="shadow-lg border border-amber-50">
                                <CardHeader>
                                    <CardTitle>Hoạt động gần đây</CardTitle>
                                    <CardDescription>Thời điểm bạn đăng ký các khóa học.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {recentActivities.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center">
                                            Chưa có hoạt động nào. Bắt đầu đăng ký khóa học để thấy lịch sử ở đây.
                                        </p>
                                    ) : (
                                        recentActivities.map((course) => (
                                            <div key={course.id} className="flex gap-3 items-start">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatTimeAgo(course.enrolledAt || course.createdAt)} •{" "}
                                                        {course.lecturerName}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border border-amber-50">
                                <CardHeader>
                                    <CardTitle className="text-xl">Mẹo học tập</CardTitle>
                                    <CardDescription>
                                        Tối ưu hiệu quả học tập với các gợi ý phù hợp.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <p className="font-semibold text-amber-900">
                                            Đặt mục tiêu mỗi tuần
                                        </p>
                                        <p className="text-amber-800 mt-1">
                                            Lên lịch học cố định để giữ nhịp độ và hoàn thành khóa học đúng hạn.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="font-semibold text-indigo-900">
                                            Ghi chú khi học
                                        </p>
                                        <p className="text-indigo-800 mt-1">
                                            Tổng hợp ghi chú giúp bạn nắm chắc kiến thức và dễ dàng ôn luyện.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

