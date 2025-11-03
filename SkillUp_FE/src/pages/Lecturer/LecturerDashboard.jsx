import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  BookOpen,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

/**
 * LecturerDashboard - Main dashboard for accepted lecturers
 * Shows overview of courses, earnings, students, etc.
 */
function LecturerDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    totalHours: 0
  });

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
    // API endpoint: GET /api/Lecturer/dashboard-stats
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Placeholder data - replace with actual API call
    setStats({
      totalCourses: 3,
      totalStudents: 145,
      totalEarnings: 12500,
      totalHours: 24
    });
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-3 h-3" />
                {trend > 0 ? '+' : ''}{trend}% so với tuần trước
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-2">Chào mừng trở lại! Dưới đây là tổng quan về hoạt động của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Khóa học"
          value={stats.totalCourses}
          trend={12}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Học viên"
          value={stats.totalStudents}
          trend={8}
          color="bg-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          trend={15}
          color="bg-yellow-500"
        />
        <StatCard
          icon={Clock}
          label="Giờ dạy"
          value={stats.totalHours}
          trend={-2}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Khóa học gần đây</CardTitle>
              <CardDescription>Các khóa học bạn đang dạy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Course Item */}
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          React Advanced Patterns
                        </p>
                        <p className="text-sm text-gray-600">
                          45 học viên • 12 bài học
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Học viên mới đăng ký</p>
                    <p className="text-gray-600">5 học viên vừa đăng ký</p>
                    <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Bài tập được nộp</p>
                    <p className="text-gray-600">12 bài tập cần chấm điểm</p>
                    <p className="text-xs text-gray-500 mt-1">1 ngày trước</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Bình luận mới</p>
                    <p className="text-gray-600">8 bình luận cần phản hồi</p>
                    <p className="text-xs text-gray-500 mt-1">3 ngày trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Tạo khóa học mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Xem chi tiết thống kê
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Quản lý học viên
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sắp diễn ra</CardTitle>
            <CardDescription>Các sự kiện sắp tới của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upcoming Item */}
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Live Q&A Session
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Thứ 5, 15:00 - 16:00
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Sắp diễn ra
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Buổi hỏi đáp trực tiếp với 45 học viên
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LecturerDashboard;