import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Timer,
  Clock3,
  RefreshCw,
  PlayCircle,
  Share2,
  Shield,
  Info,
  AlertTriangle,
} from "lucide-react";
import { getQuizResult } from "@/api/quizAPI";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

const QuizResultDetail = ({ submissionId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Drawer animation
  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  useEffect(() => {
    fetchResultDetail();
  }, [submissionId]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      const data = await getQuizResult(submissionId);

      if (data && data.length > 0) {
        setResultData(data[0]);
        setSelectedQuestion(0); // Select first question by default
      } else {
        toast.error("Không thể tải chi tiết kết quả");
        handleClose();
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết kết quả");
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const correctCount =
    resultData?.questions.filter((q) => q.isQuestionCorrect).length || 0;
  const totalQuestions = resultData?.questions.length || 0;
  const scorePercent = resultData?.score || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Full width drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full bg-[#fffffe] z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-[#ffd803] animate-spin mb-4" />
            <p className="text-[#2d334a]">Đang tải chi tiết...</p>
          </div>
        ) : resultData ? (
          <div className="min-h-screen flex flex-col">
            {/* Top bar */}
            <header className="w-full border-b border-[#272343]/10 bg-[#fffffe]/80 backdrop-blur sticky top-0 z-10">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#272343] bg-[#e3f6f5] flex items-center justify-center text-[#272343] text-base font-semibold tracking-tight">
                    Q
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-tight text-[#272343]">
                      Kết quả bài kiểm tra
                    </span>
                    <span className="text-xs text-[#2d334a]">
                      {resultData.quizTitle} · {totalQuestions} câu hỏi
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[#272343] bg-[#ffd803] px-3 py-1.5 shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-[#fffffe] flex items-center justify-center text-[#272343]">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-[#272343]">
                        Điểm số của bạn
                      </span>
                      <span className="text-sm font-semibold tracking-tight text-[#272343]">
                        {correctCount} / {totalQuestions} ·{" "}
                        {scorePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-[#e3f6f5] rounded-lg transition-colors border border-[#272343]/20"
                  >
                    <X className="w-5 h-5 text-[#272343]" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] gap-4 sm:gap-6">
                  {/* Left: overall result */}
                  <aside className="bg-[#fffffe] border border-[#272343] rounded-2xl shadow-sm flex flex-col">
                    {/* Score + status */}
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 border-b border-[#272343]/10 flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl border-2 border-[#272343] bg-[#e3f6f5] flex items-center justify-center">
                          <span className="text-lg font-semibold tracking-tight text-[#272343]">
                            {scorePercent.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-[#272343] flex items-center justify-center",
                            resultData.isPassed
                              ? "bg-[#ffd803]"
                              : "bg-[#bae8e8]"
                          )}
                        >
                          {resultData.isPassed ? (
                            <CheckCircle2 className="w-3 h-3 text-[#272343]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#272343]" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight text-[#272343]">
                          {resultData.isPassed
                            ? "Bạn đã vượt qua bài kiểm tra"
                            : "Chưa vượt qua bài kiểm tra"}
                        </span>
                        <span className="text-sm text-[#2d334a]">
                          Trạng thái: {resultData.isPassed ? "Đạt" : "Chưa đạt"}
                        </span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="px-4 sm:px-5 pt-4 pb-5 border-b border-[#272343]/10">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[#272343]/20 bg-[#e3f6f5]/60 px-3 py-3">
                          <span className="text-xs text-[#2d334a]">
                            Trả lời đúng
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-lg font-semibold tracking-tight text-[#272343]">
                              {correctCount}
                            </span>
                            <span className="text-xs text-[#2d334a]">
                              / {totalQuestions}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#272343]/20 bg-[#fffffe] px-3 py-3">
                          <span className="text-xs text-[#2d334a]">
                            Câu sai
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-lg font-semibold tracking-tight text-[#272343]">
                              {totalQuestions - correctCount}
                            </span>
                            <span className="text-xs text-[#2d334a]">câu</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#272343]/20 bg-[#fffffe] px-3 py-3">
                          <span className="text-xs text-[#2d334a]">
                            Điểm số
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-lg font-semibold tracking-tight text-[#272343]">
                              {scorePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#272343]/20 bg-[#fffffe] px-3 py-3">
                          <span className="text-xs text-[#2d334a]">
                            Tổng câu
                          </span>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-lg font-semibold tracking-tight text-[#272343]">
                              {totalQuestions}
                            </span>
                            <span className="text-xs text-[#2d334a]">câu</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="px-4 sm:px-5 pt-4 pb-3">
                      <span className="text-xs font-medium text-[#2d334a]">
                        Chú thích câu hỏi
                      </span>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#2d334a]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-green-500 bg-green-100"></span>
                          Đúng
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-red-100"></span>
                          Sai
                        </span>
                      </div>
                    </div>

                    {/* Question distribution */}
                    <div className="px-4 sm:px-5 pb-5">
                      <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {resultData.questions.map((q, index) => {
                          const isCorrect = q.isQuestionCorrect;
                          const isSelected = selectedQuestion === index;

                          return (
                            <button
                              key={q.questionId}
                              onClick={() => setSelectedQuestion(index)}
                              className={cn(
                                "aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all",
                                isSelected
                                  ? "ring-2 ring-[#272343] ring-offset-2"
                                  : "",
                                isCorrect
                                  ? "border-2 border-green-500 bg-green-100 text-green-800 hover:bg-green-200"
                                  : "border-2 border-red-500 bg-red-100 text-red-800 hover:bg-red-200"
                              )}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>

                  {/* Right: detailed question review */}
                  <section className="bg-[#fffffe] border border-[#272343] rounded-2xl shadow-sm flex flex-col">
                    {/* Header */}
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-[#272343]/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight text-[#272343]">
                          Xem lại chi tiết
                        </span>
                        <span className="text-sm text-[#2d334a]">
                          Xem lại câu trả lời và đáp án đúng
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleClose}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#272343]/40 bg-[#fffffe] px-3 py-1.5 text-sm font-medium text-[#272343] hover:bg-[#e3f6f5] transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Đóng</span>
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
                      {selectedQuestion !== null &&
                        resultData.questions[selectedQuestion] && (
                          <div className="border border-[#272343]/10 rounded-2xl overflow-hidden">
                            {(() => {
                              const question =
                                resultData.questions[selectedQuestion];
                              const isCorrect = question.isQuestionCorrect;
                              const selectedAnswers =
                                question.allAnswers.filter(
                                  (a) => a.wasSelected
                                );
                              const correctAnswers = question.allAnswers.filter(
                                (a) => a.isCorrect
                              );

                              return (
                                <>
                                  <div
                                    className={cn(
                                      "px-4 sm:px-5 py-3 border-b border-[#272343]/10 flex flex-wrap items-center justify-between gap-3",
                                      isCorrect ? "bg-green-50" : "bg-red-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={cn(
                                          "inline-flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-medium",
                                          isCorrect
                                            ? "border-green-500 bg-green-100 text-green-800"
                                            : "border-red-500 bg-red-100 text-red-800"
                                        )}
                                      >
                                        {selectedQuestion + 1}
                                      </span>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold tracking-tight text-[#272343]">
                                          Câu hỏi {selectedQuestion + 1}
                                        </span>
                                        <span className="text-xs text-[#2d334a]">
                                          Loại:{" "}
                                          {question.type === "MultiChoice"
                                            ? "Nhiều đáp án"
                                            : "Một đáp án"}{" "}
                                          · Trạng thái:{" "}
                                          {isCorrect ? "Đúng" : "Sai"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="px-4 sm:px-5 py-4 space-y-4">
                                    {/* Question text */}
                                    <div
                                      className="text-sm text-[#2d334a] leading-relaxed prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={createMarkup(
                                        question.title
                                      )}
                                    />

                                    {/* Question image */}
                                    {question.image && (
                                      <img
                                        src={question.image}
                                        alt="Question"
                                        className="w-full max-w-md rounded-lg"
                                      />
                                    )}

                                    {/* Answers with 4 states */}
                                    <div className="space-y-2">
                                      {question.allAnswers.map((answer) => {
                                        const isSelected = answer.wasSelected;
                                        const isCorrectAnswer =
                                          answer.isCorrect;

                                        let borderColor = "border-[#272343]/20";
                                        let bgColor = "bg-[#fffffe]";
                                        let textColor = "text-[#272343]";
                                        let labelColor = "text-gray-600";
                                        let icon = null;
                                        let showMissedLabel = false;

                                        if (isCorrectAnswer && isSelected) {
                                          // Case 1: Correct answer AND you selected it - GREEN FILLED
                                          borderColor = "border-emerald-500";
                                          bgColor = "bg-emerald-50";
                                          textColor = "text-emerald-900";
                                          labelColor = "text-emerald-700";
                                          icon = (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          );
                                        } else if (
                                          isCorrectAnswer &&
                                          !isSelected
                                        ) {
                                          // Case 2: Correct answer BUT you didn't select it - GREEN BORDER DASHED
                                          borderColor =
                                            "border-emerald-500 border-dashed";
                                          bgColor = "bg-emerald-50/30";
                                          textColor = "text-emerald-800";
                                          labelColor = "text-emerald-600";
                                          icon = (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                          );
                                          showMissedLabel = true;
                                        } else if (
                                          !isCorrectAnswer &&
                                          isSelected
                                        ) {
                                          // Case 3: Wrong answer AND you selected it - RED
                                          borderColor = "border-red-500";
                                          bgColor = "bg-red-50";
                                          textColor = "text-red-900";
                                          labelColor = "text-red-700";
                                          icon = (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                          );
                                        }
                                        // Case 4: Wrong answer and NOT selected - stays neutral (default styling)

                                        return (
                                          <div
                                            key={answer.answerId}
                                            className={cn(
                                              "rounded-xl border-2 px-3 py-2 flex items-start gap-2",
                                              borderColor,
                                              bgColor
                                            )}
                                          >
                                            {icon && (
                                              <div className="flex-shrink-0 mt-0.5">
                                                {icon}
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <p
                                                className={cn(
                                                  "text-sm font-medium",
                                                  textColor
                                                )}
                                              >
                                                {answer.answerName}
                                              </p>
                                              {isSelected && (
                                                <p
                                                  className={cn(
                                                    "text-xs mt-1 font-medium",
                                                    labelColor
                                                  )}
                                                >
                                                  {isCorrectAnswer
                                                    ? "✓ Bạn đã chọn đúng"
                                                    : "✗ Bạn chọn sai"}
                                                </p>
                                              )}
                                              {showMissedLabel && (
                                                <p className="text-xs text-amber-600 mt-1 font-medium">
                                                  ⚠ Đáp án đúng (bạn đã bỏ lỡ)
                                                </p>
                                              )}
                                              {isCorrectAnswer &&
                                                !isSelected &&
                                                !showMissedLabel && (
                                                  <p className="text-xs text-emerald-700 mt-1 font-semibold">
                                                    ✓ Đáp án đúng
                                                  </p>
                                                )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Show explanation for wrong answers
                                    {!isCorrect && (
                                      <div className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-3">
                                        <div className="flex items-start gap-2">
                                          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-sm font-semibold text-amber-900">
                                              {question.type === "MultiChoice"
                                                ? "Các đáp án đúng"
                                                : "Đáp án đúng"}
                                            </p>
                                            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                                              <span className="font-semibold">
                                                {correctAnswers
                                                  .map((a) => a.answerName)
                                                  .join(", ")}
                                              </span>
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )} */}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}

                      {/* Navigation */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              setSelectedQuestion(
                                Math.max(0, selectedQuestion - 1)
                              )
                            }
                            disabled={selectedQuestion === 0}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#272343] bg-[#ffd803] px-4 py-2 text-sm font-medium text-[#272343] shadow-sm hover:bg-[#ffd803]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            ← Câu trước
                          </button>
                          <button
                            onClick={() =>
                              setSelectedQuestion(
                                Math.min(
                                  totalQuestions - 1,
                                  selectedQuestion + 1
                                )
                              )
                            }
                            disabled={selectedQuestion === totalQuestions - 1}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#272343] bg-[#ffd803] px-4 py-2 text-sm font-medium text-[#272343] shadow-sm hover:bg-[#ffd803]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Câu sau →
                          </button>
                        </div>
                        <p className="text-xs text-[#2d334a]">
                          Câu {selectedQuestion + 1} / {totalQuestions}
                        </p>
                      </div>
                    </div>

                    {/* Bottom meta */}
                    <div className="px-4 sm:px-6 py-3 border-t border-[#272343]/10 flex flex-wrap items-center justify-between gap-3 bg-[#fffffe]/80">
                      <div className="flex items-center gap-2 text-xs text-[#2d334a]">
                        <Shield className="w-4 h-4 text-[#272343]" />
                        <span>
                          Kết quả được lưu an toàn. Bạn có thể xem lại bất cứ
                          lúc nào.
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default QuizResultDetail;
