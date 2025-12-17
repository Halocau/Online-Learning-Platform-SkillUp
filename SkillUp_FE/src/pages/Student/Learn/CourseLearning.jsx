import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { courseAPI } from "@/api/courseAPI";
import { markLessonComplete, trackLessonView } from "@/api/lessonAPI";
import { ratingAPI } from "@/api/ratingAPI";
import { toast } from "react-toastify";
import { BookOpen, Loader2 } from "lucide-react";
import CourseSidebar from "./components/CourseSidebar.jsx";
import LessonContent from "./components/Lesson/LessonContent.jsx";
import CourseOverview from "./components/CourseOverview.jsx";
import SectionDetail from "./components/SectionDetail.jsx";
import RatingModal from "./components/Rating/RatingModal.jsx";
import CourseCompletionPage from "./components/CourseCompletionPage.jsx";

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
  const [userRating, setUserRating] = useState(null);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
  const [showCompletionPage, setShowCompletionPage] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  useEffect(() => {
    fetchCourseDetail();
    checkUserRating();
  }, [courseId, sectionId, lessonId]);

  // Track lesson view khi vào lesson
  useEffect(() => {
    if (lessonId && currentItem?. kind === "Lesson") {
      trackLessonView(lessonId);
    }
  }, [lessonId, currentItem]);

  const checkUserRating = async () => {
    try {
      const response = await ratingAPI.getCourseRatings(courseId);
      
      // Handle different response structures
      let ratings = [];
      
      if (response?. data?.data) {
        // If response has nested data structure
        ratings = Array.isArray(response.data. data) ? response.data.data : [];
      } else if (response?. data) {
        // If response. data is the array
        ratings = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        // If response itself is the array
        ratings = response;
      }
  
      console.log("Ratings response:", response); // Debug log
      console.log("Parsed ratings array:", ratings); // Debug log
  
      const currentUserId = localStorage.getItem("userId");
  
      if (! currentUserId) {
        console.warn("No userId found in localStorage");
        setUserRating(null);
        return;
      }
  
      // Find the user's rating
      const existingRating = ratings.find(
        (r) =>
          r.userId === currentUserId || 
          r.userId === parseInt(currentUserId) ||
          String(r.userId) === String(currentUserId)
      );
  
      console.log("Found user rating:", existingRating); // Debug log
      setUserRating(existingRating || null);
    } catch (error) {
      console.error("Error checking user rating:", error);
      console.error("Error details:", error.response); // Additional debug info
      setUserRating(null);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseLearningDetail(courseId);
      const course = response.data.data[0];
      setCourseData(course);

      const hasRating =
        course.ratingId !== null && course.ratingId !== undefined;
      setHasShownCompletionModal(hasRating);
      
      // Extract completed items from API response
      const completed = new Set();
      course.sections.forEach((section) => {
        section.items?. forEach((item) => {
          if (item.isCompleted === true) {
            completed.add(item.id);
          }
        });
      });
      setCompletedItems(completed);

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
          `/student/learn/${courseId}/section/${currentSection.id}/lesson/${prevItem. id}`
        );
      } else {
        const secIdx = courseData.sections.findIndex(
          (s) => s.id === currentSection.id
        );
        if (secIdx > 0) {
          const prevSec = courseData.sections[secIdx - 1];
          const lastItem = prevSec.items[prevSec.items.length - 1];
          navigate(
            `/student/learn/${courseId}/section/${prevSec. id}/lesson/${lastItem.id}`
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
      idx < currentSection.items. length - 1 ||
      courseData.sections. findIndex((s) => s.id === currentSection.id) <
        courseData.sections.length - 1
    );
  };

  const hasPrev = () => {
    if (!currentSection || !currentItem) return false;
    const idx = currentSection.items.findIndex((i) => i.id === currentItem. id);
    return (
      idx > 0 ||
      courseData.sections.findIndex((s) => s.id === currentSection.id) > 0
    );
  };

  // Calculate if course will be complete after this item
  const checkIfCourseWillBeComplete = useCallback(
    (newCompletedItems) => {
      if (!courseData) return false;

      const total = courseData.sections.reduce(
        (a, s) => a + (s.items?.length || 0),
        0
      );

      return newCompletedItems.size >= total && total > 0;
    },
    [courseData]
  );

  // NEW: Function to check course completion after data refresh
  const checkCourseCompletionAfterRefresh = useCallback((refreshedCourseData) => {
    if (!refreshedCourseData || hasShownCompletionModal) return;

    // Count completed items from refreshed data
    const completed = new Set();
    refreshedCourseData.sections.forEach((section) => {
      section.items?.forEach((item) => {
        if (item.isCompleted === true) {
          completed.add(item.id);
        }
      });
    });

    const total = refreshedCourseData.sections.reduce(
      (a, s) => a + (s.items?.length || 0),
      0
    );

    const isComplete = completed.size >= total && total > 0;

    if (isComplete) {
      setHasShownCompletionModal(true);
      setShowCompletionPage(true);

      setTimeout(() => {
        navigate(`/student/learn/${courseId}/complete`, { replace: true });
      }, 300);
    }
  }, [hasShownCompletionModal, courseId, navigate]);

  const handleItemComplete = async (itemId) => {
    try {
      await markLessonComplete(itemId);

      const newCompletedItems = new Set([...completedItems, itemId]);
      setCompletedItems(newCompletedItems);

      const willBeComplete = checkIfCourseWillBeComplete(newCompletedItems);

      if (willBeComplete && ! hasShownCompletionModal) {
        setHasShownCompletionModal(true);
        setShowCompletionPage(true);

        setTimeout(() => {
          navigate(`/student/learn/${courseId}/complete`, { replace: true });
        }, 300);
      } else {
        toast.success("Đã đánh dấu hoàn thành");
      }

      await fetchCourseDetail();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Không thể đánh dấu hoàn thành.  Vui lòng thử lại.");

      // Revert optimistic update
      setCompletedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const calculateProgress = () => {
    const total = courseData.sections.reduce(
      (a, s) => a + (s.items?.length || 0),
      0
    );
    return total > 0 ? (completedItems.size / total) * 100 : 0;
  };

  // FIXED: Check for course completion after quiz is completed
  const handleQuizComplete = async () => {
    try {
      const response = await courseAPI.getCourseLearningDetail(courseId);
      const refreshedCourse = response.data.data[0];
      
      // Update course data
      setCourseData(refreshedCourse);

      // Update completed items
      const completed = new Set();
      refreshedCourse.sections.forEach((section) => {
        section.items?.forEach((item) => {
          if (item.isCompleted === true) {
            completed. add(item.id);
          }
        });
      });
      setCompletedItems(completed);

      // Check if course is now complete
      checkCourseCompletionAfterRefresh(refreshedCourse);
    } catch (error) {
      console.error("Error refreshing course after quiz:", error);
      toast.error("Không thể cập nhật tiến độ khóa học");
    }
  };

  const handleRatingSubmit = async (data) => {
    try {
      await ratingAPI.createRating({
        courseId:  data.courseId,
        star: data.star,
        contents: data.contents,
      });
      toast.success("Gửi đánh giá thành công!");

      setShowRatingModal(false);

      await Promise.all([checkUserRating(), fetchCourseDetail()]);

      setTimeout(() => { }, 1000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
      throw error;
    }
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

  const isOverview = ! sectionId && !lessonId;
  const isSectionDetail = sectionId && !lessonId;
  const isLessonView = sectionId && lessonId;
  const isCompletionPage = location.pathname.includes("/complete");

  const TransitionOverlay = () =>
    transitioning ? (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-150">
        <Loader2 className="w-8 h-8 text-[#FFD54F] animate-spin" />
      </div>
    ) : null;

  if (isCompletionPage) {
    return (
      <div className="animate-fadeIn">
        <CourseCompletionPage
          courseData={courseData}
          onOpenRatingModal={() => setShowRatingModal(true)}
          userRating={userRating}
        />
        {showRatingModal && (
          <RatingModal
            courseName={courseData.title}
            courseId={courseId}
            existingRating={userRating}
            onSubmit={handleRatingSubmit}
            onClose={() => setShowRatingModal(false)}
          />
        )}
        <TransitionOverlay />
      </div>
    );
  }

  if (isOverview) {
    return (
      <div className="animate-fadeIn">
        <CourseOverview
          courseData={courseData}
          completedItems={completedItems}
          courseId={courseId}
          userRating={userRating}
          onOpenRatingModal={() => setShowRatingModal(true)}
          hasRatingId={
            courseData.ratingId !== null && courseData.ratingId !== undefined
          }
        />
        {showRatingModal && (
          <RatingModal
            courseName={courseData.title}
            courseId={courseId}
            existingRating={userRating}
            onSubmit={handleRatingSubmit}
            onClose={() => setShowRatingModal(false)}
          />
        )}
        <TransitionOverlay />
      </div>
    );
  }

  if (isSectionDetail && currentSection) {
    return (
      <div className="animate-fadeIn">
        <SectionDetail
          section={currentSection}
          courseId={courseId}
          completedItems={completedItems}
          courseData={courseData}
        />
        <TransitionOverlay />
      </div>
    );
  }

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
            isAiSupportEnabled={courseData.isAiSupport}
          />
        </div>

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