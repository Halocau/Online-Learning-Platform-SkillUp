import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
  Eye,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseAPI } from "@/api/courseAPI";

function CoursePreview() {
  const location = useLocation();
  const { courseId } = useParams();
  const navigate = useNavigate();

  // USE location.state first!
  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!location.state?.course);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

  // Fallback loader if the course isn't present (e.g. refresh or external link)
  useEffect(() => {
    if (!course) {
      setLoading(true);
      setError(null);
      courseAPI
        .getCourseById(courseId)
        .then((res) => {
          if (res.data.code === 200) setCourse(res.data.data);
          else setError("Không thể tải khóa học");
        })
        .catch(() => setError("Không thể tải khóa học"))
        .finally(() => setLoading(false));
    }
  }, [course, courseId]);

  // expand all sections on first load
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
    return "Quiz";
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
console.log("location.state:", location.state);
console.log("course:", course);

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
          <p className="text-xl font-bold text-gray-800 mb-2">Không thể tải khóa học</p>
          <div className="text-gray-600 mb-4">{error || "Không tìm thấy khóa học hoặc không có dữ liệu."}</div>
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

  const totalDuration = calculateTotalDuration();
  const totalLessons =
    course.sections?.reduce((sum, section) => sum + (section.items?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 animate-fadeIn">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fadeIn-slow">
          <div className="flex items-start gap-6">
            <img
              src={course.image}
              alt={course.title}
              className="w-48 h-32 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/192x128";
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                  Đang chờ duyệt
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>
                    {course.sections?.length || 0} chương
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-green-500" />
                  <span>{totalLessons} bài học</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
            <p className="text-gray-600 mt-1">
              {course.sections?.length || 0} chương • {totalLessons} bài học
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {course.sections && course.sections.length > 0 ? (
              course.sections
                .sort((a, b) => a.orders - b.orders)
                .map((section) => (
                  <div key={section.id} className="bg-white">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold shadow-md">
                          {section.orders}
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {section.items?.length || 0} bài học
                          </p>
                        </div>
                      </div>
                      <ChevronLeft
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform",
                          expandedSections.has(section.id) ? "-rotate-90" : ""
                        )}
                      />
                    </button>

                    {/* Section Items */}
                    {expandedSections.has(section.id) && (
                      <div className="px-6 pb-4 space-y-2 bg-gray-50">
                        {section.items && section.items.length > 0 ? (
                          section.items
                            .sort((a, b) => a.orders - b.orders)
                            .map((item, index) => {
                              const color = getItemColor(item);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedItem(item)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                    selectedItem?.id === item.id
                                      ? "border-yellow-400 bg-yellow-50"
                                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
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
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span
                                        className={cn(
                                          "text-xs px-2 py-0.5 rounded-full",
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
                                  {getItemIcon(item)}
                                </button>
                              );
                            })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Chưa có bài học</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có chương nào
                </h3>
                <p>Khóa học này chưa có nội dung</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Item Preview */}
        {selectedItem && (
          <div className="mt-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 animate-fadeIn-fast">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                {getItemIcon(selectedItem)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedItem.title}
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {getItemType(selectedItem)}
                </span>
              </div>
            </div>
            {selectedItem.kind === "Lesson" &&
              selectedItem.lessonType === "Video" && (
                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <PlayCircle className="w-16 h-16 mx-auto mb-3" />
                    <p>Video không khả dụng trong chế độ xem trước</p>
                  </div>
                </div>
            )}
            {selectedItem.kind === "Lesson" &&
              selectedItem.lessonType === "Text" && (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedItem.assets?.[0]?.content ||
                      "<p>Không có nội dung</p>",
                  }}
                />
            )}
            {selectedItem.kind === "Quiz" && (
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">
                    Quiz: {selectedItem.title}
                  </h4>
                </div>
                <p className="text-purple-700">
                  Quiz không khả dụng trong chế độ xem trước
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 animate-fadeIn-slow">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500 text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">
                Lưu ý về xem trước
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Video và Quiz không khả dụng trong chế độ xem trước</li>
                <li>• Đây chỉ là bản xem trước nội dung khóa học của bạn</li>
                <li>• Sau khi được duyệt, học viên sẽ có thể truy cập đầy đủ nội dung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePreview;