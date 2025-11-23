import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import {
  PlayCircle,
  Clock,
  Target,
  Trophy,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuizResult } from "@/api/quizAPI";
import { toast } from "sonner";

const QuizView = ({ quiz, onComplete, isCompleted }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseId, sectionId, lessonId } = useParams();

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  // Check for submissionId in URL params
  const submissionId = searchParams.get("submissionId");

  // Fetch quiz result when submissionId is present
  useEffect(() => {
    if (submissionId) {
      fetchQuizResult(submissionId);
    }
  }, [submissionId]);

  const fetchQuizResult = async (id) => {
    try {
      setLoadingResult(true);
      const data = await getQuizResult(id);
      if (data && data.length > 0) {
        setQuizResult(data[0]);
        setQuizCompleted(true);
        setScore(data[0].score);

        // Mark as completed if passed
        if (data[0].isPassed) {
          onComplete(true);
        }
      }
    } catch (error) {
      toast.error("Không thể tải kết quả quiz");
    } finally {
      setLoadingResult(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(
      `/student/learn/${courseId}/section/${sectionId}/lesson/${lessonId}/take`
    );
  };

  const handleRetakeQuiz = () => {
    navigate(
      `/student/learn/${courseId}/section/${sectionId}/lesson/${lessonId}`
    );
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleReviewContent = () => {
    // Navigate back to section overview
    navigate(`/student/learn/${courseId}/section/${sectionId}`);
  };

  // Loading state when fetching result
  if (loadingResult) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Loader2 className="w-12 h-12 text-[#FFD54F] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải kết quả...</p>
      </div>
    );
  }

  // Results screen with API data
  if (quizCompleted && quizResult) {
    const passed = quizResult.isPassed;
    const correctCount = quizResult.questions.filter(
      (q) => q.isQuestionCorrect
    ).length;
    const totalQuestions = quizResult.questions.length;

    return (
      <div className="max-w-3xl mx-auto px-6 py-8 animate-fadeIn">
        <div className="max-w-2xl mx-auto px-6 py-10 text-center border border-gray-200 rounded-2xl bg-white shadow-sm">
          {/* Status icon */}
          <div
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
              passed ? "bg-green-100" : "bg-red-100"
            )}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          {/* Main title */}
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
            {passed ? "Chúc mừng!" : "Hãy cố gắng thêm!"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {passed
              ? "Bạn đã hoàn thành bài kiểm tra này."
              : "Bạn chưa đạt điểm yêu cầu."}
          </p>

          {/* Score + summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left sm:text-center">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Điểm của bạn</p>
              <p className="text-xl font-semibold text-gray-900">
                {quizResult.score.toFixed(1)}%
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  passed ? "text-green-600" : "text-red-600"
                )}
              >
                {passed
                  ? `Vượt mục tiêu ${quiz.passPercent}%`
                  : `Cần ${quiz.passPercent}% để đạt`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  passed ? "text-green-600" : "text-red-600"
                )}
              >
                {passed ? "Đạt" : "Chưa đạt"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Cần {quiz.passPercent}% để vượt qua
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Tổng quan</p>
              <p className="text-sm font-semibold text-gray-900">
                {correctCount} / {totalQuestions} câu đúng
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Có thể xem lại chi tiết bên dưới
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">
                Tiến độ đạt mục tiêu
              </span>
              <span className="text-xs font-medium text-gray-900">
                {quizResult.score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={cn(
                  "h-3 rounded-full transition-all",
                  passed ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${quizResult.score}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cần tối thiểu{" "}
              <span className="font-medium text-gray-700">
                {quiz.passPercent}%
              </span>{" "}
              để đạt.
            </p>
          </div>

          {/* Quick review of each question */}
          <div className="text-left mb-8">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Tóm tắt câu trả lời
            </h4>

            <div className="space-y-3">
              {quizResult.questions.map((question, index) => {
                const isCorrect = question.isQuestionCorrect;
                const selectedAnswer = question.allAnswers.find(
                  (a) => a.wasSelected
                );
                const correctAnswer = question.allAnswers.find(
                  (a) => a.isCorrect
                );

                return (
                  <div
                    key={question.questionId}
                    className={cn(
                      "p-3 rounded-xl border",
                      isCorrect
                        ? "border-green-100 bg-green-50/60"
                        : "border-red-100 bg-red-50/70"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">
                          Câu {index + 1} · {isCorrect ? "Đúng" : "Sai"}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {question.title}
                        </p>
                        {!isCorrect && selectedAnswer && correctAnswer && (
                          <p className="text-xs text-gray-600 mt-1">
                            Bạn đã chọn:{" "}
                            <span className="font-medium">
                              {selectedAnswer.answerName}
                            </span>
                            . Đáp án đúng:{" "}
                            <span className="font-medium">
                              {correctAnswer.answerName}
                            </span>
                            .
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRetakeQuiz}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Làm lại bài kiểm tra
            </button>
            <button
              onClick={handleReviewContent}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem lại nội dung bài học
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already completed view (without submissionId)
  if (isCompleted && !submissionId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Trophy className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đã hoàn thành!</h3>
        <p className="text-gray-600 mb-6">
          Bạn đã hoàn thành bài kiểm tra này.
        </p>
        <button
          onClick={handleStartQuiz}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Làm lại
        </button>
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <PlayCircle className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {quiz.title || "Sẵn sàng kiểm tra?"}
        </h3>
        <p className="text-gray-600">
          {quiz.description || "Đánh giá kiến thức của bạn về nội dung đã học"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Thời gian</p>
          <p className="text-lg font-bold text-gray-900">{quiz.timer} phút</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <Target className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Điểm đạt</p>
          <p className="text-lg font-bold text-gray-900">{quiz.passPercent}%</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <CheckCircle2 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Câu hỏi</p>
          <p className="text-lg font-bold text-gray-900">
            {quiz.questionCount || 0}
          </p>
        </div>
      </div>

      <button
        onClick={handleStartQuiz}
        className="w-full px-8 py-4 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold rounded-lg transition-all transform hover:scale-[1.02]"
      >
        Bắt đầu
      </button>
    </div>
  );
};

export default QuizView;
