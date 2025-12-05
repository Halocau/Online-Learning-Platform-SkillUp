import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  List,
  DollarSign,
  Tag,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CourseLandingPageTab from "./CourseLandingPageTab";
import CurriculumTab from "./CurriculumTab";
import PricingTab from "./PricingTab";
import VoucherTab from "./VoucherTab";

function CourseDetailManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("landing");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Track completion status explicitly
  const [completionStatus, setCompletionStatus] = useState({
    landing: false,
    curriculum: false,
    pricing: false,
  });

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

  const loadCourseDetail = async (options = {}) => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseDetail(courseId);

      if (response.data.code === 200 && response.data.data.length > 0) {
        const courseData = response.data.data[0];
        setCourse(courseData);

        // Update completion status based on actual data
        updateCompletionStatus(courseData, options);
      } else {
        toast.error("Không tìm thấy khóa học");
        navigate("/lecturer/courses");
      }
    } catch (error) {
      console.error("Error loading course:", error);

      if (error.response?.status === 500) {
        toast.error(
          "Lỗi server: " + (error.response?.data?.message || "Vui lòng thử lại")
        );
      } else {
        toast.error("Lỗi khi tải thông tin khóa học");
      }

      if (error.response?.status === 404) {
        navigate("/lecturer/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCompletionStatus = (courseData, options = {}) => {
    const newStatus = {
      landing: checkLandingCompleted(courseData),
      curriculum: checkCurriculumCompleted(courseData),
      pricing: checkPricingCompleted(courseData, options),
    };

    setCompletionStatus(newStatus);
  };

  const checkLandingCompleted = (courseData) => {
    return !!(
      courseData.title &&
      courseData.description &&
      courseData.categoryName &&
      courseData.subCategoryName
    );
  };

  const checkCurriculumCompleted = (courseData) => {
    // Must have at least one section
    if (!courseData.sections || courseData.sections.length === 0) {
      return false;
    }

    // At least one section must have at least one item (lesson or quiz)
    const hasContent = courseData.sections.some(
      (section) => section.items && section.items.length > 0
    );

    return hasContent;
  };

  const checkPricingCompleted = (courseData, options = {}) => {
    if (options.pricingCompleted) {
      return true;
    }

    return (
      courseData.price !== null &&
      courseData.price !== undefined &&
      courseData.price >= 0
    );
  };

  const handleBackToCourses = () => {
    navigate("/lecturer/courses");
  };

  // Check if each step is completed
  const isStepCompleted = (tabId) => {
    if (!course) return false;

    switch (tabId) {
      case "landing":
        return completionStatus.landing;
      case "curriculum":
        return completionStatus.curriculum;
      case "pricing":
        return completionStatus.pricing;
      case "voucher":
        return true; // Voucher is optional
      default:
        return false;
    }
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const requiredTabs = tabs.filter((tab) => tab.id !== "voucher");
    const completedSteps = requiredTabs.filter((tab) =>
      isStepCompleted(tab.id)
    ).length;
    return Math.round((completedSteps / requiredTabs.length) * 100);
  };

  // Handle updates from child tabs - refresh immediately
  const handleTabUpdate = async (options = {}) => {
    try {
      // Reload course data
      const response = await courseAPI.getCourseDetail(courseId);

      if (response.data.code === 200 && response.data.data.length > 0) {
        const courseData = response.data.data[0];
        setCourse(courseData);

        // Update completion status
        updateCompletionStatus(courseData, options);

        // Show success feedback if needed
        if (options.showSuccess) {
          toast.success(options.successMessage || "Cập nhật thành công!");
        }
      }
    } catch (error) {
      console.error("Error refreshing course:", error);
      // Don't show error to user, just log it
    }
  };

  const handleSubmitForPreview = async () => {
    const requiredTabs = tabs.filter((tab) => tab.id !== "voucher");
    const allCompleted = requiredTabs.every((tab) => isStepCompleted(tab.id));

    if (!allCompleted) {
      // Find which steps are incomplete
      const incompleteSteps = requiredTabs
        .filter((tab) => !isStepCompleted(tab.id))
        .map((tab) => tab.label)
        .join(", ");

      toast.warning(`Vui lòng hoàn thành các bước sau: ${incompleteSteps}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await courseAPI.publishCourse(courseId);

      if (response.data.code === 200) {
        toast.success(
          "Đề xuất khóa học thành công! Đang chuyển về danh sách khóa học...",
          {
            autoClose: 2000,
          }
        );

        setTimeout(() => {
          navigate("/lecturer/courses");
        }, 2000);
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể đề xuất khóa học. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fffffe]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD54F] mx-auto mb-4"></div>
          <p className="text-[#2d334a]">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-[#272343]/15 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToCourses}
                className="flex items-center gap-2 hover:bg-[#e3f6f5] rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Quay lại khóa học</span>
              </Button>
              <div className="border-l border-[#272343]/20 h-8"></div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-[#272343] line-clamp-1 tracking-tight">
                  {course?.title || "Khóa học"}
                </h1>
                <p className="text-sm text-[#2d334a]">
                  Chỉnh sửa chi tiết khóa học
                </p>
              </div>
            </div>

            {/* Progress Badge */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-[#2d334a] font-medium tracking-tight">
                  Tiến độ hoàn thành
                </p>
                <p className="text-lg font-bold text-[#FFD54F]">{progress}%</p>
              </div>
              <div className="w-32 bg-[#e3f6f5] rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#FFD54F] to-[#F4C430] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar for Mobile */}
        <div className="md:hidden px-6 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#e3f6f5] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#FFD54F] to-[#F4C430] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-[#FFD54F] min-w-[40px] text-right">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-72 bg-white border-r border-[#272343]/15 min-h-[calc(100vh-73px)] sticky top-[73px] hidden lg:block shadow-sm">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-[#2d334a] uppercase mb-4 px-3 tracking-tight">
              Quản lý nội dung khóa học
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isCompleted = isStepCompleted(tab.id);
                const isRequired = tab.id !== "voucher";

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-[#FFD54F]/20 to-[#FFD54F]/10 text-[#272343] font-semibold shadow-sm border border-[#FFD54F]/30"
                        : "text-[#2d334a] hover:bg-[#e3f6f5] border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[#FFD54F] text-[#272343]"
                          : "bg-[#e3f6f5] text-[#2d334a] group-hover:bg-[#bae8e8]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? "text-[#FFD54F]"
                              : isCompleted
                              ? "text-green-500"
                              : "text-[#2d334a]"
                          }`}
                        />
                        <span className="text-sm tracking-tight">
                          {tab.label}
                        </span>
                        {!isRequired && (
                          <span className="text-xs text-[#2d334a]/60">
                            (Tùy chọn)
                          </span>
                        )}
                      </div>
                      {isCompleted && !isActive && (
                        <p className="text-xs text-green-600 mt-0.5 ml-6">
                          Đã hoàn thành
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

              <div className="pt-2">
                <div className="border-t border-[#272343]/10"></div>
              </div>
            </nav>

            {/* Progress Summary */}
            <div className="mt-6 p-4 bg-gradient-to-br from-[#e3f6f5]/60 to-[#bae8e8]/40 rounded-2xl border border-[#272343]/10">
              <h3 className="text-sm font-semibold text-[#272343] mb-2 tracking-tight">
                Tổng quan tiến độ
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#2d334a]">Đã hoàn thành:</span>
                  <span className="font-bold text-[#FFD54F]">
                    {
                      tabs.filter(
                        (tab) => tab.id !== "voucher" && isStepCompleted(tab.id)
                      ).length
                    }
                    /{tabs.filter((tab) => tab.id !== "voucher").length} bước
                  </span>
                </div>
                {progress === 100 && (
                  <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg text-xs text-green-700 font-medium text-center">
                    ✓ Tất cả đã hoàn thành! Có thể đề xuất khóa học
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitForPreview}
              disabled={progress < 100 || submitting}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 mt-2 ${
                progress === 100
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 text-green-800 cursor-pointer"
                  : "bg-[#e3f6f5]/40 border border-[#272343]/10 text-[#2d334a]/60 cursor-not-allowed opacity-60"
              }`}
            >
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${
                  progress === 100
                    ? "bg-green-500 text-white"
                    : "bg-[#e3f6f5] text-[#2d334a]/60"
                }`}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold tracking-tight">
                  {submitting ? "Đang gửi..." : "Đề xuất khóa học"}
                </span>
                {progress < 100 && (
                  <p className="text-xs text-[#2d334a]/60 mt-0.5">
                    Hoàn thành {100 - progress}% để đề xuất
                  </p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pb-24 lg:pb-6">
          {ActiveComponent && (
            <ActiveComponent
              course={course}
              courseId={courseId}
              onUpdate={handleTabUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailManagement;
