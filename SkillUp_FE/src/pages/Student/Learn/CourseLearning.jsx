import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { courseAPI } from "@/api/courseAPI";
import { toast } from "sonner";
import { BookOpen, Award, ArrowLeft } from "lucide-react";
import ProgressBar from "./components/ProgressBar";
import CommentSection from "./components/CommentSection";
import RatingModal from "./components/RatingModal";
import CourseSidebar from "./components/CourseSidebar";
import LessonContent from "./components/LessonContent";
import CourseOverview from "./components/CourseOverview";

const CourseLearning = () => {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId, sectionId]);

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
          const itemId = searchParams.get("item");
          const item = itemId
            ? section.items.find((i) => i.id === itemId)
            : section.items[0];
          setCurrentItem(item || null);
        } else {
          navigate(`/student/learn/${courseId}`);
        }
      }
    } catch (error) {
      toast.error("Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item, section) => {
    setCurrentItem(item);
    navigate(`/student/learn/${courseId}/${section.id}?item=${item.id}`, {
      replace: true,
    });
  };

  const handleNext = () => {
    if (!currentSection || !currentItem) return;
    const items = currentSection.items;
    const idx = items.findIndex((i) => i.id === currentItem.id);
    if (idx < items.length - 1) {
      handleItemSelect(items[idx + 1], currentSection);
    } else {
      const secIdx = courseData.sections.findIndex(
        (s) => s.id === currentSection.id
      );
      if (secIdx < courseData.sections.length - 1) {
        const nextSec = courseData.sections[secIdx + 1];
        navigate(`/student/learn/${courseId}/${nextSec.id}`);
      }
    }
  };

  const handlePrev = () => {
    if (!currentSection || !currentItem) return;
    const items = currentSection.items;
    const idx = items.findIndex((i) => i.id === currentItem.id);
    if (idx > 0) {
      handleItemSelect(items[idx - 1], currentSection);
    } else {
      const secIdx = courseData.sections.findIndex(
        (s) => s.id === currentSection.id
      );
      if (secIdx > 0) {
        const prevSec = courseData.sections[secIdx - 1];
        const lastItem = prevSec.items[prevSec.items.length - 1];
        navigate(
          `/student/learn/${courseId}/${prevSec.id}?item=${lastItem.id}`
        );
      }
    }
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

  const handleItemComplete = (itemId) => {
    setCompletedItems((prev) => new Set([...prev, itemId]));
    checkCourseCompletion();
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD54F]"></div>
      </div>
    );
  if (!courseData)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">Không tìm thấy khóa học</h2>
      </div>
    );

  const isOverview = !sectionId;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <CourseSidebar
        courseData={courseData}
        currentItem={currentItem}
        currentSection={currentSection}
        completedItems={completedItems}
        onItemSelect={handleItemSelect}
        isOverview={isOverview}
        courseId={courseId}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOverview ? (
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.title}
                </h1>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/student/learn/${courseId}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentSection?.title}
                  </h1>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ProgressBar progress={calculateProgress()} />
              {calculateProgress() === 100 && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#FFD54F] text-gray-900 rounded-lg text-sm font-medium hover:bg-[#FFC107]"
                >
                  <Award className="w-4 h-4" /> Đánh giá
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content — ONLY ONE SCROLL */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {isOverview ? (
            <CourseOverview
              courseData={courseData}
              completedItems={completedItems}
              courseId={courseId}
            />
          ) : currentItem ? (
            <LessonContent
              item={currentItem}
              section={currentSection}
              onComplete={handleItemComplete}
              isCompleted={completedItems.has(currentItem.id)}
              onNext={handleNext}
              onPrev={handlePrev}
              hasNext={hasNext()}
              hasPrev={hasPrev()}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
              <p>Chọn một mục để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          courseName={courseData.title}
          onSubmit={() => {}}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default CourseLearning;
