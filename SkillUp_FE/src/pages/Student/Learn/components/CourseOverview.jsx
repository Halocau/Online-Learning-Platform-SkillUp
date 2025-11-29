import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Trophy,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

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

    return { videos, texts, quizzes };
  };

  const calculateOverallProgress = () => {
    const total = courseData.sections.reduce(
      (acc, s) => acc + (s.items?.length || 0),
      0
    );
    return total > 0 ? Math.round((completedItems.size / total) * 100) : 0;
  };

  const overallProgress = calculateOverallProgress();
  const totalLessons = courseData.sections.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-white via-[#FFD54F]/5 to-white">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute right-10 top-10 -z-10 h-[10rem] w-[20rem] rounded-full bg-[#FFD54F]/20 blur-3xl"></div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
          {/* Back Button */}
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-courses")}
            className="mb-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200"
          >
            <ArrowLeft size={16} />
            <span>Quay lại khóa học của tôi</span>
          </motion.button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Main Content */}
            <div className="relative flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD54F]/30 bg-[#FFD54F]/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-tight text-[#B8860B]">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#FFD54F]"></span>
                <span>Khóa học</span>
                {overallProgress > 0 && (
                  <span className="rounded-full bg-[#FFD54F]/20 px-2 py-0.5 text-[0.65rem] font-medium text-[#B8860B]">
                    Đang học
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {courseData.title}
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                {courseData.description}
              </p>

              {/* Stats Strip */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-medium text-gray-500">
                      Chương học
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {courseData.sections?.length || 0} chương
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-medium text-gray-500">
                      Bài học
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {totalLessons} bài
                    </div>
                  </div>
                </div>

                {overallProgress > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#FFD54F]/30 bg-[#FFD54F]/10 px-3 py-2 shadow-sm sm:px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#FFD54F]/30 text-[#B8860B] ring-1 ring-[#FFD54F]/40">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-medium text-[#B8860B]">
                        Tiến độ tổng
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {overallProgress}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Progress Card */}
            {overallProgress > 0 && (
              <aside className="mt-2 w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:p-5 lg:mt-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-tight text-gray-500">
                      Tiến độ khóa học
                    </div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                      {overallProgress}%
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      Bạn đã hoàn thành {completedItems.size}/{totalLessons} bài
                      học.
                    </p>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="rgba(229, 231, 235, 1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <defs>
                        <linearGradient
                          id="overallGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#FFD54F" />
                          <stop offset="100%" stopColor="#FFC107" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="url(#overallGrad)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="314"
                        strokeDashoffset={314 - (314 * overallProgress) / 100}
                      />
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {overallProgress}%
                      </span>
                    </div>
                  </div>
                </div>

                {overallProgress === 100 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-200">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      Hoàn thành xuất sắc!
                    </span>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum / Sections List */}
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6">
        <div className="space-y-4">
          {/* Section Cards */}
          {courseData.sections.map((section, sectionIndex) => {
            const progress = getSectionProgress(section);
            const isStarted = progress > 0;
            const isCompleted = progress === 100;
            const { videos, texts, quizzes } = getItemCounts(section);
            const completedCount = section.items.filter((i) =>
              completedItems.has(i.id)
            ).length;

            return (
              <motion.article
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.05, duration: 0.3 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#FFD54F]/40 hover:shadow-lg sm:p-5"
              >
                {/* Hover glow effect */}
                <div className="pointer-events-none absolute inset-y-6 right-0 w-32 bg-gradient-to-l from-[#FFD54F]/10 via-transparent to-transparent opacity-0 blur-3xl transition-opacity group-hover:opacity-100"></div>

                <div className="relative flex items-start gap-4 sm:gap-5">
                  {/* Section */}
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200 shadow-inner">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tracking-tight ring-1 ${
                        isCompleted
                          ? "bg-emerald-400/15 text-emerald-600 ring-emerald-400/60"
                          : isStarted
                          ? "bg-[#FFD54F]/15 text-[#B8860B] ring-[#FFD54F]/60"
                          : "bg-gray-100 text-gray-600 ring-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        sectionIndex + 1
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-tight text-gray-700 ring-1 ring-gray-200">
                            Chương {sectionIndex + 1}
                          </span>
                          {isStarted && (
                            <span className="hidden text-[0.7rem] text-emerald-600 sm:inline-flex">
                              {isCompleted
                                ? "Hoàn thành"
                                : `Đã hoàn thành ${completedCount}/${section.items?.length} bài`}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                          {section.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          {videos > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                              <PlayCircle className="h-3.5 w-3.5 text-sky-500" />
                              <span>{videos} video</span>
                            </span>
                          )}
                          {texts > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                              <FileText className="h-3.5 w-3.5 text-amber-500" />
                              <span>{texts} bài đọc</span>
                            </span>
                          )}
                          {quizzes > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                              <HelpCircle className="h-3.5 w-3.5 text-violet-500" />
                              <span>{quizzes} quiz</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(
                            `/student/learn/${courseId}/section/${section.id}`
                          );
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FFD54F]/90 px-4 py-2 text-xs font-semibold tracking-tight text-gray-900 shadow-sm transition-all hover:bg-[#FFD54F] hover:shadow-md relative z-10"
                      >
                        {isStarted ? "Tiếp tục" : "Bắt đầu"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>

                    {/* Progress Bar */}
                    {isStarted && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[0.7rem] text-gray-600">
                          <span>Tiến độ chương</span>
                          <span className="font-semibold text-emerald-600">
                            {completedCount}/{section.items?.length} bài (
                            {progress}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, delay: sectionIndex * 0.05 }}
                            className={`h-full rounded-full ${
                              isCompleted
                                ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                                : "bg-gradient-to-r from-[#FFD54F] via-[#FFC107] to-[#FFB300]"
                            }`}
                          ></motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CourseOverview;