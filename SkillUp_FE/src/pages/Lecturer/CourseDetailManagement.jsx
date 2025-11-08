import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, List, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CourseLandingPageTab from "./tabs/CourseLandingPageTab";
import CurriculumTab from "./tabs/CurriculumTab";
import PricingTab from "./tabs/PricingTab";
import VoucherTab from "./tabs/VoucherTab";

function CourseDetailManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("landing");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    {
      id: "landing",
      label: "Trang giới thiệu",
      icon: BookOpen,
      component: CourseLandingPageTab,
    },
    {
      id: "curriculum",
      label: "Khung chương trình",
      icon: List,
      component: CurriculumTab,
    },
    {
      id: "pricing",
      label: "Giá khóa học",
      icon: DollarSign,
      component: PricingTab,
    },
    {
      id: "voucher",
      label: "Phiếu giảm giá",
      icon: Tag,
      component: VoucherTab,
    },
  ];

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseDetail(courseId);

      if (response.data.code === 200 && response.data.data.length > 0) {
        setCourse(response.data.data[0]);
      } else {
        toast.error("Không tìm thấy khóa học");
        navigate("/lecturer/courses");
      }
    } catch (error) {
      console.error("Error loading course:", error);

      // Don't navigate away on error - just show error message
      if (error.response?.status === 500) {
        toast.error(
          "Lỗi server: " + (error.response?.data?.message || "Vui lòng thử lại")
        );
      } else {
        toast.error("Lỗi khi tải thông tin khóa học");
      }

      // Only navigate away if it's a 404
      if (error.response?.status === 404) {
        navigate("/lecturer/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCourses = () => {
    navigate("/lecturer/courses");
  };

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToCourses}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Quay lại khóa học</span>
              </Button>
              <div className="border-l border-gray-300 h-8"></div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-1">
                  {course?.title || "Khóa học"}
                </h1>
                <p className="text-sm text-gray-500">
                  Chỉnh sửa chi tiết khóa học
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] hidden lg:block">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4 px-3">
              Plan Your Course
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pb-24 lg:pb-6">
          {ActiveComponent && (
            <ActiveComponent
              course={course}
              courseId={courseId}
              onUpdate={loadCourseDetail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailManagement;
