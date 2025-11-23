import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { courseAPI } from "@/api/courseAPI";
import { markLessonComplete, trackLessonView } from "@/api/lessonAPI";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
import CourseSidebar from "./components/CourseSidebar";
import LessonContent from "./components/LessonContent";
import CourseOverview from "./components/CourseOverview";
import SectionDetail from "./components/SectionDetail";
import RatingModal from "./components/RatingModal";

const CourseLearning = () => {
  const { courseId, sectionId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId, sectionId, lessonId]);

  // Track lesson view khi vào lesson
  useEffect(() => {
    if (lessonId && currentItem?.kind === "Lesson") {
      trackLessonView(lessonId);
    }
  }, [lessonId, currentItem]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseDetail(courseId);
      const course = response.data.data[0];
      setCourseData(course);

      if (sectionId) {
        const section = course.sections.find((s) => s.id === sectionId);
        if (section) {
          setCurrentSection(section);

          if (lessonId) {
            const item = section.items.find((i) => i.id === lessonId);
            setCurrentItem(item || null);
          } else {
            setCurrentItem(null);
          }
        } else {
          navigate(`/student/learn/${courseId}`);
        }
      } else {
        setCurrentSection(null);
        setCurrentItem(null);
      }
    } catch (error) {
      toast.error("Không thể tải khóa học");
    } finally {
      setTimeout(() => setLoading(false), 150);
    }
  };

  const handleItemSelect = (item, section) => {
    setTransitioning(true);
    setCurrentItem(item);

    setTimeout(() => {
      navigate(
        `/student/learn/${courseId}/section/${section.id}/lesson/${item.id}`,
        { replace: true }
      );
      setTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    if (!currentSection || !currentItem) return;

    setTransitioning(true);
    const items = currentSection.items;
    const idx = items.findIndex((i) => i.id === currentItem.id);

    setTimeout(() => {
      if (idx < items.length - 1) {
        const nextItem = items[idx + 1];
        navigate(
          `/student/learn/${courseId}/section/${currentSection.id}/lesson/${nextItem.id}`
        );
      } else {
        const secIdx = courseData.sections.findIndex(
          (s) => s.id === currentSection.id
        );
        if (secIdx < courseData.sections.length - 1) {
          const nextSec = courseData.sections[secIdx + 1];
          navigate(`/student/learn/${courseId}/section/${nextSec.id}`);
        }
      }
      setTransitioning(false);
    }, 150);
  };

  const handlePrev = () => {
    if (!currentSection || !currentItem) return;

    setTransitioning(true);
    const items = currentSection.items;
    const idx = items.findIndex((i) => i.id === currentItem.id);

    setTimeout(() => {
      if (idx > 0) {
        const prevItem = items[idx - 1];
        navigate(
          `/student/learn/${courseId}/section/${currentSection.id}/lesson/${prevItem.id}`
        );
      } else {
        const secIdx = courseData.sections.findIndex(
          (s) => s.id === currentSection.id
        );
        if (secIdx > 0) {
          const prevSec = courseData.sections[secIdx - 1];
          const lastItem = prevSec.items[prevSec.items.length - 1];
          navigate(
            `/student/learn/${courseId}/section/${prevSec.id}/lesson/${lastItem.id}`
          );
        }
      }
      setTransitioning(false);
    }, 150);
  };

  const hasNext = () => {
    if (!currentSection || !currentItem) return false;
    const idx = currentSection.items.findIndex((i) => i.id === currentItem.id);
    return (
      idx < currentSection.items.length - 1 ||
      courseData.sections.findIndex((s) => s.id === currentSection.id) <
        courseData.sections.length - 1
    );
  };

  const hasPrev = () => {
    if (!currentSection || !currentItem) return false;
    const idx = currentSection.items.findIndex((i) => i.id === currentItem.id);
    return (
      idx > 0 ||
      courseData.sections.findIndex((s) => s.id === currentSection.id) > 0
    );
  };

  const handleItemComplete = async (itemId) => {
    try {
      await markLessonComplete(itemId);
      setCompletedItems((prev) => new Set([...prev, itemId]));
      checkCourseCompletion();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      // Vẫn cập nhật local state nếu API lỗi
      setCompletedItems((prev) => new Set([...prev, itemId]));
    }
  };

  const checkCourseCompletion = () => {
    const total = courseData.sections.reduce(
      (a, s) => a + (s.items?.length || 0),
      0
    );
    if (completedItems.size + 1 >= total && total > 0) {
      setShowRatingModal(true);
    }
  };

  const calculateProgress = () => {
    const total = courseData.sections.reduce(
      (a, s) => a + (s.items?.length || 0),
      0
    );
    return total > 0 ? (completedItems.size / total) * 100 : 0;
  };
  const handleQuizComplete = async () => {
    await fetchCourseDetail();
  };
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#FFD54F] animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Đang tải khóa học...</p>
      </div>
    );

  // Error screen
  if (!courseData)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Không tìm thấy khóa học</h2>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-4 px-6 py-2 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
        >
          Quay lại trang chủ
        </button>
      </div>
    );

  const isOverview = !sectionId && !lessonId;
  const isSectionDetail = sectionId && !lessonId;
  const isLessonView = sectionId && lessonId;

  // Transition overlay
  const TransitionOverlay = () =>
    transitioning ? (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-150">
        <Loader2 className="w-8 h-8 text-[#FFD54F] animate-spin" />
      </div>
    ) : null;

  if (isOverview) {
    return (
      <div className="animate-fadeIn">
        <CourseOverview
          courseData={courseData}
          completedItems={completedItems}
          courseId={courseId}
        />
        {showRatingModal && (
          <RatingModal
            courseName={courseData.title}
            onSubmit={() => {}}
            onClose={() => setShowRatingModal(false)}
          />
        )}
        <TransitionOverlay />
      </div>
    );
  }

  // SECTION DETAIL VIEW
  if (isSectionDetail && currentSection) {
    return (
      <div className="animate-fadeIn">
        <SectionDetail
          section={currentSection}
          courseId={courseId}
          completedItems={completedItems}
          courseData={courseData}
        />
        {showRatingModal && (
          <RatingModal
            courseName={courseData.title}
            onSubmit={() => {}}
            onClose={() => setShowRatingModal(false)}
          />
        )}
        <TransitionOverlay />
      </div>
    );
  }

  // LESSON VIEW
  if (isLessonView && currentItem) {
    const progress = calculateProgress();

    return (
      <div className="flex min-h-screen w-full bg-gray-50 overflow-x-hidden">
        <CourseSidebar
          courseData={courseData}
          currentItem={currentItem}
          currentSection={currentSection}
          completedItems={completedItems}
          onItemSelect={handleItemSelect}
          courseId={courseId}
          progress={progress}
        />

        <div className="flex-1 w-full overflow-x-hidden">
          <LessonContent
            item={currentItem}
            section={currentSection}
            onComplete={handleItemComplete}
            isCompleted={completedItems.has(currentItem.id)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={hasNext()}
            hasPrev={hasPrev()}
            lessonId={lessonId}
            onQuizComplete={handleQuizComplete}
          />
        </div>

        {showRatingModal && (
          <RatingModal
            courseName={courseData.title}
            onSubmit={() => {}}
            onClose={() => setShowRatingModal(false)}
          />
        )}
        <TransitionOverlay />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
      <p>Không tìm thấy nội dung</p>
    </div>
  );
};

export default CourseLearning;
