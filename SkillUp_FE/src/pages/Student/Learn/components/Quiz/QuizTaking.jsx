import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Loader2,
  Save,
  Send,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { startQuiz, submitQuiz } from "@/api/quizAPI";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quizData || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizData, timeRemaining]);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      const data = await startQuiz(quizId);

      if (data && data.length > 0) {
        const quizInfo = data[0];
        setQuizData(quizInfo);
        setSubmissionId(quizInfo.submissionId);
        setTimeRemaining(quizInfo.timer * 60);
      } else {
        toast.error("Không thể tải câu hỏi");
        navigate(-1);
      }
    } catch (error) {
      toast.error("Không thể bắt đầu quiz");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerId, isMultiple) => {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        const newAnswers = current.includes(answerId)
          ? current.filter((id) => id !== answerId)
          : [...current, answerId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [answerId] };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      // Format answers for API
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        selectedAnswerIds: answers[questionId],
      }));

      const result = await submitQuiz(submissionId, formattedAnswers);

      if (result && result.length > 0) {
        toast.success(
          "Bạn hoàn thành phần học Quiz. Quay lại trang học để xem kết quả",
          {
            duration: 3000,
          }
        );

        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (error) {
      toast.error("Không thể nộp bài. Vui lòng thử lại!");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m : ${secs.toString().padStart(2, "0")}s`;
  };

  const getUnansweredCount = () => {
    if (!quizData || !quizData.questions) return 0;
    return quizData.questions.filter((q) => !answers[q.questionId]).length;
  };

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (!quizData || !quizData.questions) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ffd803] animate-spin mx-auto mb-4" />
          <p className="text-[#2d334a]">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  // Safety check: ensure questions array exists and has items
  if (!quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center">
          <p className="text-[#2d334a] mb-4">
            Không có câu hỏi nào trong bài kiểm tra
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#ffd803] hover:bg-[#ffd803]/90 text-[#272343] font-medium rounded-lg border border-[#272343]"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center">
          <p className="text-[#2d334a]">Không tìm thấy câu hỏi</p>
        </div>
      </div>
    );
  }

  const isMultiple = currentQuestion.type === "MultiChoice";
  const selectedAnswers = answers[currentQuestion.questionId] || [];

  return (
    <div className="min-h-screen bg-[#fffffe]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-[#fffffe] border-r border-[#272343]/10 p-6 min-h-screen">
          {/* Timer */}
          <div className="mb-6 p-4 bg-[#e3f6f5] border border-[#272343]/20 rounded-xl text-center">
            <p className="text-sm text-[#2d334a] mb-1 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Thời gian còn lại
            </p>
            <p
              className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                timeRemaining < 60 ? "text-red-600" : "text-[#272343]"
              )}
            >
              {formatTime(timeRemaining)}
            </p>
          </div>

          {/* Question navigation grid */}
          <div className="mb-6">
            <p className="text-xs font-medium text-[#2d334a] mb-2">
              Danh sách câu hỏi
            </p>
            <div className="grid grid-cols-5 gap-2">
              {quizData.questions.map((q, index) => {
                const isAnswered =
                  answers[q.questionId] && answers[q.questionId].length > 0;
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.questionId}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      "aspect-square rounded-lg text-xs font-medium transition-all border",
                      isCurrent
                        ? "border-[#272343] bg-[#ffd803] text-[#272343] ring-2 ring-[#272343] ring-offset-2"
                        : isAnswered
                        ? "border-[#272343] bg-[#e3f6f5] text-[#272343] hover:bg-[#e3f6f5]/80"
                        : "border-[#272343]/20 bg-[#fffffe] text-[#2d334a] hover:bg-[#e3f6f5]/30"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => fetchQuizQuestions()}
              className="w-full px-4 py-2.5 bg-[#fffffe] border-2 border-[#272343]/40 hover:bg-[#e3f6f5] text-[#272343] rounded-lg font-medium transition-colors"
            >
              🔄 Tải lại
            </button>
          </div>

          {/* Submit and Save buttons */}
          <div className="space-y-2 mb-6">
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || getUnansweredCount() > 0}
              className="w-full px-4 py-2.5 bg-[#ffd803] hover:bg-[#ffd803]/90 border border-[#272343] text-[#272343] rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4" />
              Nộp bài
            </button>

            <button className="w-full px-4 py-2.5 bg-[#fffffe] border-2 border-[#272343]/40 text-[#272343] hover:bg-[#e3f6f5] rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Lưu bài làm
            </button>
          </div>

          {/* Notes dropdown */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full px-4 py-2.5 bg-[#fffffe] border-2 border-[#272343]/40 text-[#272343] hover:bg-[#e3f6f5] rounded-lg font-medium transition-colors flex items-center justify-between"
          >
            <span>Lưu ý khi làm bài</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showNotes && "rotate-180"
              )}
            />
          </button>

          {showNotes && (
            <div className="mt-2 p-4 bg-[#e3f6f5]/60 border border-[#272343]/20 rounded-lg text-sm text-[#2d334a]">
              <ul className="list-disc list-inside space-y-1">
                <li>Làm lần lượt các câu hỏi</li>
                <li>Kiểm tra kỹ trước khi nộp</li>
                <li>Thời gian làm bài có hạn</li>
              </ul>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 bg-[#fffffe]">
          <div className="max-w-4xl mx-auto">
            {/* Warning for unanswered */}
            {getUnansweredCount() > 0 && (
              <div className="mb-6 p-4 bg-[#ffd803]/20 border border-[#ffd803] rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#272343] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#272343]">
                    Bạn còn {getUnansweredCount()} câu chưa trả lời
                  </p>
                  <p className="text-xs text-[#2d334a] mt-1">
                    Hãy đảm bảo trả lời tất cả câu hỏi trước khi nộp bài
                  </p>
                </div>
              </div>
            )}

            {/* Question card */}
            <div className="bg-[#fffffe] rounded-2xl border-2 border-[#272343] p-8 shadow-sm">
              {/* Question header */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#272343] mb-2 tracking-tight">
                  CÂU HỎI {currentQuestionIndex + 1} (
                  {isMultiple ? "NHIỀU ĐÁP ÁN" : "MỘT ĐÁP ÁN"})
                </h2>
                <div className="h-1 w-20 bg-[#ffd803] rounded"></div>
              </div>

              {/* Question content */}
              <div
                className="prose prose-lg max-w-none mb-6 text-[#272343]"
                dangerouslySetInnerHTML={createMarkup(currentQuestion.title)}
              />

              {/* Question image */}
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question"
                  className="w-full max-w-2xl rounded-lg mb-6 border border-[#272343]/20"
                />
              )}

              {/* Answers */}
              <div className="space-y-3">
                {currentQuestion.answers.map((answer) => {
                  const isSelected = selectedAnswers.includes(answer.answerId);

                  return (
                    <button
                      key={answer.answerId}
                      onClick={() =>
                        handleAnswerSelect(
                          currentQuestion.questionId,
                          answer.answerId,
                          isMultiple
                        )
                      }
                      className={cn(
                        "w-full p-4 text-left rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-[#272343] bg-[#e3f6f5]"
                          : "border-[#272343]/20 hover:border-[#272343]/40 bg-[#fffffe]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio/Checkbox */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? "border-[#272343] bg-[#ffd803]"
                              : "border-[#272343]/40"
                          )}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#272343]" />
                          )}
                        </div>

                        {/* Answer text */}
                        <span className="text-[#272343] flex-1 font-medium">
                          {answer.answerName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons - OUTSIDE the box, aligned with it */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#272343] bg-[#ffd803] px-4 py-2 text-sm font-medium text-[#272343] shadow-sm hover:bg-[#ffd803]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Câu trước
              </button>
              <button
                onClick={handleNext}
                disabled={
                  currentQuestionIndex === quizData.questions.length - 1
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[#272343] bg-[#ffd803] px-4 py-2 text-sm font-medium text-[#272343] shadow-sm hover:bg-[#ffd803]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Câu sau →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#fffffe] rounded-xl p-8 text-center border-2 border-[#272343]">
            <Loader2 className="w-12 h-12 text-[#ffd803] animate-spin mx-auto mb-4" />
            <p className="text-[#272343] font-medium">Đang nộp bài...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTakingPage;
