import { useEffect, useState } from "react";
import { courseAPI } from "@/api/courseAPI";
import CourseCard from "@/pages/Home/components/CourseCard";
import {
    BookOpen,
    Loader2,
    TrendingUp,
    Clock,
    Award,
    ArrowRight,
    PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalCourses: 0,
        inProgress: 0,
        completed: 0,
        totalHours: 0,
    });

    useEffect(() => {
        console.log("StudentDashboard mounted");
        loadEnrolledCourses();
    }, []);

    const loadEnrolledCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Loading enrolled courses...");
            const response = await courseAPI.getStudentEnrolledCourses();
            console.log("API Response:", response);

            // API trả về: { code: 200, message: "...", data: [[courses...]] }
            if (response.data && response.data.code === 200 && response.data.data) {
                // data là array of arrays, lấy phần tử đầu tiên (array các courses)
                const courses = Array.isArray(response.data.data[0])
                    ? response.data.data[0]
                    : response.data.data;
                console.log("Enrolled courses:", courses);
                setEnrolledCourses(courses);

                // Update stats
                setStats({
                    totalCourses: courses.length,
                    inProgress: courses.length, // Có thể tính toán dựa trên progress thực tế
                    completed: 0, // Có thể tính toán dựa trên progress thực tế
                    totalHours: courses.length * 10, // Placeholder
                });
            } else {
                throw new Error(response.data?.message || "Không thể tải danh sách khóa học");
            }
        } catch (err) {
            console.error("Error loading enrolled courses:", err);
            setError(err.message || "Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => {
        const IconComponent = Icon;
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2">{label}</p>
                            <p className="text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${color}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Lấy 4 khóa học gần đây nhất
    const recentCourses = enrolledCourses.slice(0, 4);

    return (
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
                    {/* Enrolled Courses Section - Smaller */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Khóa học đã đăng ký</CardTitle>
                                    <CardDescription>
                                        Các khóa học bạn đã đăng ký
                                    </CardDescription>
                                </div>
                                {enrolledCourses.length > 4 && (
                                    <Link to="/student">
                                        <Button variant="ghost" size="sm">
                                            Xem tất cả
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#FFD54F]" />
                                        <span className="ml-3 text-gray-600">Đang tải...</span>
                                    </div>
                                ) : error ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                ) : recentCourses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào</p>
                                        <Link to="/">
                                            <Button className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900">
                                                Khám phá khóa học
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {recentCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                                            >
                                                <Link to={`/course/${course.id}`}>
                                                    <div className="aspect-video overflow-hidden bg-gray-100">
                                                        <img
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#FFD54F] transition-colors mb-2">
                                                            {course.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {course.lecturerName}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">
                                                                {course.enrollmentCount} học viên
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    window.location.href = `/course/${course.id}`;
                                                                }}
                                                            >
                                                                Tiếp tục học
                                                                <ArrowRight className="w-3 h-3 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
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
                                <div className="space-y-4 text-sm">
                                    {enrolledCourses.length > 0 ? (
                                        <>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Đã đăng ký khóa học mới
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {enrolledCourses[0]?.title || "Khóa học"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {enrolledCourses[0]?.enrolledAt
                                                            ? new Date(enrolledCourses[0].enrolledAt).toLocaleDateString("vi-VN")
                                                            : "Gần đây"}
                                                    </p>
                                                </div>
                                            </div>
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
                                        </>
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
                                    <Link
                                        key={course.id}
                                        to={`/course/${course.id}`}
                                        className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-[#FFD54F] transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FFD54F] transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {course.lecturerName}
                                            </p>
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-[#FFD54F] h-1.5 rounded-full"
                                                        style={{ width: "30%" }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">30% hoàn thành</p>
                                            </div>
                                        </div>
                                        <PlayCircle className="w-6 h-6 text-[#FFD54F] flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
