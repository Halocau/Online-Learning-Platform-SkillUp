import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  PlayCircle,
  FileText,
  HelpCircle,
  BookOpen,
  Eye,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseAPI } from "@/api/courseAPI";
import { getQuizById } from "@/api/quizAPI";

function CoursePreview() {
  const location = useLocation();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    courseAPI
      .getCourseDetail(courseId)
      .then((res) => {
        if (res.data.code === 200) {
          const detail = Array.isArray(res.data.data)
            ? res.data.data[0]
            : res.data.data;
          setCourse(detail);
        } else {
          setError("Không thể tải khóa học");
        }
      })
      .catch(() => setError("Không thể tải khóa học"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (selectedItem && selectedItem.kind === "Quiz") {
      setLoadingQuiz(true);
      setPreviewQuiz(null);
      getQuizById(selectedItem.id)
        .then((res) => {
          let quizData = null;

          // Logic to parse the specific JSON structure you provided
          if (Array.isArray(res)) {
            quizData = res[0];
          } else if (Array.isArray(res?.data)) {
            quizData = res.data[0];
          } else if (res?.data?.data && Array.isArray(res.data.data)) {
            quizData = res.data.data[0];
          } else if (res?.data) {
            quizData = res.data;
          } else {
            quizData = res;
          }

          setPreviewQuiz(quizData);
        })
        .catch((err) => {
          console.error("Error loading quiz:", err);
          setPreviewQuiz(null);
        })
        .finally(() => setLoadingQuiz(false));
    } else {
      setPreviewQuiz(null);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (course && course.sections && course.sections.length > 0) {
      const allSectionIds = new Set(course.sections.map((s) => s.id));
      setExpandedSections(allSectionIds);
    }
  }, [course]);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getItemIcon = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? (
        <PlayCircle className="w-4 h-4" />
      ) : (
        <FileText className="w-4 h-4" />
      );
    }
    return <HelpCircle className="w-4 h-4" />;
  };

  const getItemType = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? "Video" : "Bài đọc";
    }
    return "Câu hỏi";
  };

  const getItemColor = (item) => {
    if (item.kind === "Lesson" && item.lessonType === "Video") {
      return "sky";
    }
    if (item.kind === "Lesson" && item.lessonType === "Text") {
      return "amber";
    }
    return "violet";
  };

  const calculateTotalDuration = () => {
    if (!course?.sections) return 0;
    let total = 0;
    course.sections.forEach((section) => {
      section.items?.forEach((item) => {
        if (item.kind === "Lesson" && item.duration) {
          total += item.duration;
        }
      });
    });
    return total;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="p-8 bg-white shadow-lg rounded-xl border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-800 mb-2">
            Không thể tải khóa học
          </p>
          <div className="text-gray-600 mb-4">
            {error || "Không tìm thấy khóa học hoặc không có dữ liệu."}
          </div>
          <button
            onClick={() => navigate("/lecturer/courses")}
            className="px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.sections?.reduce(
      (sum, section) => sum + (section.items?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 shadow-md sticky top-0 z-20">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">
              Chế độ xem trước - Không thể chỉnh sửa trong khi chờ duyệt
            </span>
          </div>
          <button
            onClick={() => navigate("/lecturer/courses")}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <div className="flex items-start gap-6">
            <img
              src={course.image}
              alt={course.title}
              className="w-40 h-28 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/160x112";
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                  Đang chờ duyệt
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-3 leading-relaxed text-sm line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{course.sections?.length || 0} chương</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-green-500" />
                  <span>{totalLessons} bài học</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Left Column - Course Content (Scrollable) */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  Nội dung khóa học
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {course.sections?.length || 0} chương • {totalLessons} bài học
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {course.sections && course.sections.length > 0 ? (
                    course.sections
                      .sort((a, b) => a.orders - b.orders)
                      .map((section) => (
                        <div key={section.id}>
                          {/* Section Header */}
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {section.orders}
                              </div>
                              <div className="text-left">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {section.title}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  {section.items?.length || 0} bài học
                                </p>
                              </div>
                            </div>
                            <ChevronLeft
                              className={cn(
                                "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                                expandedSections.has(section.id)
                                  ? "-rotate-90"
                                  : ""
                              )}
                            />
                          </button>

                          {/* Section Items */}
                          {expandedSections.has(section.id) && (
                            <div className="px-4 pb-2 space-y-1 bg-gray-50">
                              {section.items && section.items.length > 0 ? (
                                section.items
                                  .sort((a, b) => a.orders - b.orders)
                                  .map((item, index) => {
                                    const color = getItemColor(item);
                                    const isSelected =
                                      selectedItem?.id === item.id;
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={cn(
                                          "w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                                          isSelected
                                            ? "border-yellow-400 bg-yellow-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-6 h-6 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0",
                                            color === "sky" &&
                                              "bg-sky-100 text-sky-700",
                                            color === "amber" &&
                                              "bg-amber-100 text-amber-700",
                                            color === "violet" &&
                                              "bg-violet-100 text-violet-700"
                                          )}
                                        >
                                          {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {item.title}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                              className={cn(
                                                "text-xs px-1.5 py-0.5 rounded",
                                                color === "sky" &&
                                                  "bg-sky-100 text-sky-700",
                                                color === "amber" &&
                                                  "bg-amber-100 text-amber-700",
                                                color === "violet" &&
                                                  "bg-violet-100 text-violet-700"
                                              )}
                                            >
                                              {getItemType(item)}
                                            </span>
                                            {item.duration && (
                                              <span className="text-xs text-gray-500">
                                                {formatDuration(item.duration)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                          {getItemIcon(item)}
                                        </div>
                                      </button>
                                    );
                                  })
                              ) : (
                                <div className="text-center py-6 text-gray-500">
                                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs">Chưa có bài học</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Chưa có chương nào
                      </h3>
                      <p className="text-sm">Khóa học này chưa có nội dung</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview Content */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
              {selectedItem ? (
                <>
                  {/* Preview Header */}
                  <div className="p-4 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getItemIcon(selectedItem)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedItem.title}
                        </h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {getItemType(selectedItem)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Đóng xem trước"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Preview Content (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* VIDEO & TEXT PREVIEW (Hidden for brevity, logic remains the same) */}
                    {selectedItem.kind === "Lesson" &&
                      selectedItem.lessonType === "Video" && (
                        <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                          {selectedItem.assets?.[0]?.url &&
                          selectedItem.assets[0].url !== "default-url" ? (
                            <video
                              src={selectedItem.assets[0].url}
                              controls
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="text-center text-gray-300">
                              <PlayCircle className="w-16 h-16 mx-auto mb-3" />
                              <p>Video không khả dụng hoặc chưa có đường dẫn</p>
                            </div>
                          )}
                        </div>
                      )}

                    {selectedItem.kind === "Lesson" &&
                      selectedItem.lessonType === "Text" && (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html:
                              selectedItem.assets?.[0]?.content ||
                              "<p>Không có nội dung</p>",
                          }}
                        />
                      )}

                    {/* QUIZ PREVIEW - UPDATED SECTION */}
                    {selectedItem.kind === "Quiz" && (
                      <div>
                        {loadingQuiz ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                              <p className="text-purple-600">
                                Đang tải quiz...
                              </p>
                            </div>
                          </div>
                        ) : previewQuiz ? (
                          <div className="space-y-6">
                            {/* UPDATED QUIZ HEADER */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <HelpCircle className="w-6 h-6 text-purple-600" />
                                <h4 className="text-lg font-semibold text-purple-900 mr-2">
                                  {previewQuiz.title || selectedItem.title}
                                </h4>
                                {/* Question Count Badge */}
                                <span className="px-2.5 py-0.5 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full border border-purple-300">
                                  {previewQuiz.questions?.length || 0} Câu hỏi
                                </span>
                              </div>
                              {previewQuiz.description && (
                                <p className="text-sm text-purple-700 ml-9">
                                  {previewQuiz.description}
                                </p>
                              )}
                            </div>

                            {/* Quiz Questions */}
                            {previewQuiz.questions &&
                            previewQuiz.questions.length > 0 ? (
                              <div className="space-y-6">
                                {previewQuiz.questions
                                  .sort(
                                    (a, b) => (a.orders || 0) - (b.orders || 0)
                                  )
                                  .map((q, idx) => (
                                    <div
                                      key={q.questionId || idx}
                                      className="p-5 bg-white border-2 border-gray-200 rounded-xl"
                                    >
                                      <div className="font-semibold text-gray-900 mb-4 flex items-start gap-2">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                                          {idx + 1}
                                        </span>
                                        <div
                                          className="flex-1 pt-1"
                                          dangerouslySetInnerHTML={{
                                            __html: q.title,
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2 ml-10">
                                        {q.answers &&
                                          Array.isArray(q.answers) &&
                                          q.answers.map((ans) => (
                                            <label
                                              key={ans.answerId}
                                              className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all",
                                                ans.isCorrect
                                                  ? "bg-green-50 border-green-300"
                                                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                              )}
                                            >
                                              <input
                                                type="radio"
                                                name={`question_${
                                                  q.questionId || idx
                                                }`}
                                                value={ans.answerId}
                                                disabled
                                                className="w-4 h-4"
                                              />
                                              <span className="flex-1">
                                                {ans.answerName}
                                              </span>
                                              {ans.isCorrect && (
                                                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                                  Đáp án đúng
                                                </span>
                                              )}
                                            </label>
                                          ))}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-gray-500">
                                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Quiz chưa có câu hỏi nào.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <p className="text-red-600 font-medium">
                              Không tải được chi tiết Quiz.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Chọn một bài học để xem trước
                    </h3>
                    <p className="text-sm">
                      Chọn video, bài đọc hoặc quiz từ danh sách bên trái
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePreview;
