import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Trophy,
} from "lucide-react";

const CourseOverview = ({ courseData, completedItems, courseId }) => {
  const navigate = useNavigate();

  const getSectionProgress = (section) => {
    if (!section.items?.length) return 0;
    const completed = section.items.filter((i) =>
      completedItems.has(i.id)
    ).length;
    return Math.round((completed / section.items.length) * 100);
  };

  const getItemCounts = (section) => {
    const items = section.items || [];
    const videos = items.filter(
      (i) => i.kind === "Lesson" && i.lessonType === "Video"
    ).length;
    const texts = items.filter(
      (i) => i.kind === "Lesson" && i.lessonType === "Text"
    ).length;
    const quizzes = items.filter((i) => i.kind === "Quiz").length;

    const parts = [];
    if (videos > 0) parts.push(`${videos} video`);
    if (texts > 0) parts.push(`${texts} bài đọc`);
    if (quizzes > 0) parts.push(`${quizzes} quiz`);

    return parts.join(", ");
  };

  const getTotalDuration = (section) => {
    return `${section.items?.length * 15 || 0} phút`;
  };

  const calculateOverallProgress = () => {
    const total = courseData.sections.reduce(
      (acc, s) => acc + (s.items?.length || 0),
      0
    );
    return total > 0 ? Math.round((completedItems.size / total) * 100) : 0;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Three-Color Gradient */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-6">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 bg-[#FFD54F]/20 text-[#FFD54F] rounded-full font-semibold text-sm backdrop-blur-sm border border-[#FFD54F]/30">
                  Khóa học
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                {courseData.title}
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                {courseData.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 shadow-lg">
                  <Award className="w-6 h-6 text-[#FFD54F]" />
                  <div>
                    <div className="text-sm text-gray-400">Chương học</div>
                    <div className="text-xl font-bold">
                      {courseData.sections?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 shadow-lg">
                  <PlayCircle className="w-6 h-6 text-[#FFD54F]" />
                  <div>
                    <div className="text-sm text-gray-400">Bài học</div>
                    <div className="text-xl font-bold">
                      {courseData.sections.reduce(
                        (acc, s) => acc + (s.items?.length || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            {overallProgress > 0 && (
              <div className="flex-shrink-0 bg-white rounded-2xl shadow-2xl p-8 min-w-[280px] border border-gray-100">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 56 * (1 - overallProgress / 100)
                        }`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style={{ stopColor: "#FFD54F", stopOpacity: 1 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#FFC107", stopOpacity: 1 }}
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                          {overallProgress}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-4 font-medium">
                    Đã hoàn thành
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-semibold text-gray-900">
                      {completedItems.size}/
                      {courseData.sections.reduce(
                        (acc, s) => acc + (s.items?.length || 0),
                        0
                      )}{" "}
                      bài
                    </span>
                  </div>
                  {overallProgress === 100 && (
                    <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <Trophy className="w-5 h-5" />
                      <span className="text-sm font-semibold">
                        Hoàn thành xuất sắc!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Nội dung khóa học
        </h2>

        <div className="space-y-4">
          {courseData.sections.map((section, index) => {
            const progress = getSectionProgress(section);
            const isStarted = progress > 0;
            const isCompleted = progress === 100;

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#FFD54F]/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Section Number Badge */}
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-md ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-200"
                          : isStarted
                          ? "bg-gradient-to-br from-[#FFD54F] to-[#FFC107] text-gray-900 shadow-yellow-200"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-gray-200 group-hover:to-gray-300"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    {/* Section Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FFC107] transition-colors">
                            {section.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                              {getItemCounts(section)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/student/learn/${courseId}/section/${section.id}`
                            )
                          }
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD54F] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFB300] text-gray-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
                        >
                          {isStarted ? "Tiếp tục" : "Bắt đầu"}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {isStarted && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">
                              {progress}% hoàn thành
                            </span>
                            <span className="text-gray-500">
                              {
                                section.items.filter((i) =>
                                  completedItems.has(i.id)
                                ).length
                              }
                              /{section.items?.length || 0} bài
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isCompleted
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-gradient-to-r from-[#FFD54F] to-[#FFC107]"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
