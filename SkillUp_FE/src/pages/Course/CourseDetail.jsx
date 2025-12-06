// src/pages/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Modal, Input, Tooltip } from "antd";
import { Flag } from "lucide-react";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CourseDetailSkeleton from "@/components/course-detail/CourseDetailSkeleton";
import CourseDetailHero from "@/components/course-detail/CourseDetailHero";
import MobileStickyBar from "@/components/course-detail/StickyBar";
import CourseCurriculumSection from "@/components/course-detail/CourseCurriculumnSection";
import CourseDescriptionSection from "@/components/course-detail/CourseDescription";
import ReviewsSection from "@/components/course-detail/ReviewSection";
import MoreCoursesByLecturerSection from "@/components/course-detail/MoreCourseBy";
import LecturerSection from "@/components/course-detail/LecturerSection";
import RelatedTopicsSection from "@/components/course-detail/RelatedTopic";
import CourseEnrollmentCard from "@/components/course-detail/CourseEnrollmentCard";
import { useUserRole } from "../Auth/useUserRole";

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Report modal states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const { isStudent, isLecturer, userRole } = useUserRole();
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await courseAPI.getCourseDetail(courseId);

        if (response.data.code === 200) {
          setCourse(response.data.data[0]);
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.message || "Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!courseId || !userStr || userStr === "null") {
      setIsEnrolled(false);
      setCheckingEnrollment(false);
      return;
    }

    let isSubscribed = true;

    const checkEnrollmentStatus = async () => {
      try {
        setCheckingEnrollment(true);
        const response = await courseAPI.getStudentEnrolledCourses();
        if (!isSubscribed) return;

        if (response.data?.code === 200) {
          const enrolledCourses = response.data?.data?.[0] || [];
          const targetId = courseId.toString().toLowerCase();

          const alreadyEnrolled = enrolledCourses.some((enrollment) => {
            const candidateId =
              enrollment.courseId || enrollment.id || enrollment.course?.id;

            return (
              candidateId && candidateId.toString().toLowerCase() === targetId
            );
          });

          setIsEnrolled(alreadyEnrolled);
        } else {
          setIsEnrolled(false);
        }
      } catch (err) {
        console.error("Error checking enrollment:", err);
        if (isSubscribed) {
          setIsEnrolled(false);
        }
      } finally {
        if (isSubscribed) {
          setCheckingEnrollment(false);
        }
      }
    };

    checkEnrollmentStatus();

    return () => {
      isSubscribed = false;
    };
  }, [courseId]);

  const handleReportClick = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "null") {
      toast.error("Vui lòng đăng nhập để báo cáo khóa học");
      return;
    }
    setReportModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      toast.warning("Vui lòng nhập lý do báo cáo");
      return;
    }

    setIsReporting(true);
    try {
      await courseAPI.reportCourse({
        courseId: courseId,
        description: reportReason,
      });
      toast.success(
        "Báo cáo khóa học thành công. Chúng tôi sẽ xem xét sớm nhất."
      );
      setReportModalVisible(false);
      setReportReason("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Báo cáo thất bại");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) return <CourseDetailSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-red-600 text-xl mb-4 font-semibold">
            Lỗi: {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 mb-4 text-xl">Không tìm thấy khóa học</p>
          <Button
            onClick={() => window.history.back()}
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Report Button - Fixed position */}
      <div className="fixed top-24 right-8 z-50">
        <Tooltip
          title={<span className="text-xs">Báo cáo khóa học</span>}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={handleReportClick}
            className="p-3 bg-white shadow-lg shadow-xl rounded-full bg-red-50 text-red-600 text-gray-600 transition-all duration-200 border border-gray-200 border-red-300"
          >
            <Flag size={30} />
          </motion.button>
        </Tooltip>
      </div>

      <CourseDetailHero course={course} />

      <MobileStickyBar
        course={course}
        isEnrolled={isEnrolled}
        checkingEnrollment={checkingEnrollment}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:pb-12 pb-28">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CourseDescriptionSection description={course.description} />

            <RelatedTopicsSection
              categoryId={course.categoryId}
              categoryName={course.categoryName}
              subCategoryId={course.subCategoryId}
              subCategoryName={course.subCategoryName}
            />

            <CourseCurriculumSection sections={course.sections} />

            <LecturerSection
              lecturer={course.lecturer}
              rating={course.rating}
              enrollmentCount={course.enrollmentCount}
            />

            {/* Updated ReviewsSection with courseId prop */}
            <ReviewsSection
              courseId={courseId}
              courseRating={course.rating}
              totalReviews={course.enrollmentCount}
            />

            <MoreCoursesByLecturerSection
              lecturer={course.lecturer}
              currentCourseId={course.id}
            />
          </div>

          <div className="hidden lg:block">
            {isStudent && (
              <CourseEnrollmentCard
                course={course}
                isEnrolled={isEnrolled}
                checkingEnrollment={checkingEnrollment}
              />
            )}
          </div>
        </div>
      </div>

      {/* Report Course Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            <span>Báo cáo khóa học</span>
          </div>
        }
        open={reportModalVisible}
        onOk={handleReportSubmit}
        onCancel={() => {
          setReportModalVisible(false);
          setReportReason("");
        }}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={isReporting}
        okButtonProps={{
          danger: true,
          disabled: !reportReason.trim(),
        }}
        centered
      >
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Vui lòng mô tả lý do bạn muốn báo cáo khóa học này. Chúng tôi sẽ xem
            xét và xử lý trong thời gian sớm nhất.
          </p>
          <Input.TextArea
            placeholder="Ví dụ: Nội dung không chính xác, vi phạm bản quyền, chất lượng kém..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
            className="rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
