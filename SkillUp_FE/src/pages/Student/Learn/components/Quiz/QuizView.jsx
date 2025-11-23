import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Clock,
  Target,
  Trophy,
  Eye,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import QuizResultDetail from "./QuizResultDetail";
import { getQuizResult } from "@/api/quizAPI";

const QuizView = ({ quiz, onComplete, isCompleted }) => {
  const navigate = useNavigate();
  const [showResultDetail, setShowResultDetail] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  // Check if quiz has been completed (has submissionId from course API)
  const hasSubmission = !!quiz.quizSubmissionId;

  // Fetch actual quiz results when there's a submission
  useEffect(() => {
    if (hasSubmission && quiz.quizSubmissionId) {
      fetchQuizResult();
    }
  }, [hasSubmission, quiz.quizSubmissionId]);

  const fetchQuizResult = async () => {
    try {
      setLoadingResult(true);
      const data = await getQuizResult(quiz.quizSubmissionId);
      if (data && data.length > 0) {
        setResultData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching quiz result:", error);
    } finally {
      setLoadingResult(false);
    }
  };

  const handleStartQuiz = () => {
    // Navigate to quiz taking page (full page, not drawer)
    navigate(`/student/quiz/${quiz.id}/take`);
  };

  const handleViewDetail = () => {
    setShowResultDetail(true);
  };

  const handleRetakeQuiz = () => {
    navigate(`/student/quiz/${quiz.id}/take`);
  };

  // Start screen (no submission yet)
  if (!hasSubmission) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e3f6f5] border border-[#272343] mb-4">
            <PlayCircle className="w-8 h-8 text-[#272343]" />
          </div>
          <h3 className="text-2xl font-bold text-[#272343] mb-2 tracking-tight">
            {quiz.title || "Sẵn sàng kiểm tra?"}
          </h3>
          <p className="text-[#2d334a]">
            {quiz.description ||
              "Đánh giá kiến thức của bạn về nội dung đã học"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[#e3f6f5]/60 border border-[#272343]/20 rounded-xl text-center">
            <Clock className="w-6 h-6 text-[#272343] mx-auto mb-2" />
            <p className="text-xs text-[#2d334a]">Thời gian</p>
            <p className="text-lg font-bold text-[#272343] tracking-tight">
              {quiz.timer} phút
            </p>
          </div>

          <div className="p-4 bg-[#e3f6f5]/60 border border-[#272343]/20 rounded-xl text-center">
            <Target className="w-6 h-6 text-[#272343] mx-auto mb-2" />
            <p className="text-xs text-[#2d334a]">Điểm đạt</p>
            <p className="text-lg font-bold text-[#272343] tracking-tight">
              {quiz.passPercent}%
            </p>
          </div>

          <div className="p-4 bg-[#e3f6f5]/60 border border-[#272343]/20 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-[#272343] mx-auto mb-2" />
            <p className="text-xs text-[#2d334a]">Câu hỏi</p>
            <p className="text-lg font-bold text-[#272343] tracking-tight">
              Nhiều câu
            </p>
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          className="w-full px-8 py-4 bg-[#ffd803] hover:bg-[#ffd803]/90 text-[#272343] font-bold rounded-xl transition-all transform hover:scale-[1.02] border border-[#272343] shadow-sm"
        >
          Bắt đầu
        </button>
      </div>
    );
  }

  // Results screen (has submission)
  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-8 animate-fadeIn">
        <div className="max-w-2xl mx-auto px-6 py-10 text-center border-2 border-[#272343] rounded-2xl bg-[#fffffe] shadow-sm">
          {loadingResult ? (
            // Loading state
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-[#ffd803] animate-spin mx-auto mb-4" />
              <p className="text-[#2d334a]">Đang tải kết quả...</p>
            </div>
          ) : (
            <>
              {/* Status icon */}
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl border-2 border-[#272343] mb-6 relative ${
                  resultData?.isPassed ? "bg-[#e3f6f5]" : "bg-red-50"
                }`}
              >
                <Trophy className="w-10 h-10 text-[#272343]" />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#272343] flex items-center justify-center ${
                    resultData?.isPassed ? "bg-[#ffd803]" : "bg-red-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#272343]" />
                </div>
              </div>

              {/* Main title */}
              <h3 className="text-2xl font-bold tracking-tight text-[#272343] mb-1">
                {resultData?.isPassed ? "Đã hoàn thành!" : "Đã hoàn thành!"}
              </h3>
              <p className="text-sm text-[#2d334a] mb-6">
                Bạn đã hoàn thành bài kiểm tra này.
              </p>

              {/* Summary info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left sm:text-center">
                <div className="p-4 rounded-xl bg-[#e3f6f5]/60 border border-[#272343]/20">
                  <p className="text-xs text-[#2d334a] mb-1">Thông tin</p>
                  <p className="text-sm font-semibold text-[#272343] tracking-tight">
                    {quiz.title}
                  </p>
                  <p className="mt-1 text-xs text-[#2d334a]">
                    Điểm yêu cầu: {quiz.passPercent}%
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border border-[#272343]/20 ${
                    resultData?.isPassed ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p className="text-xs text-[#2d334a] mb-1">Kết quả của bạn</p>
                  <p
                    className={`text-lg font-bold tracking-tight ${
                      resultData?.isPassed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {resultData?.score
                      ? `${resultData.score.toFixed(1)}%`
                      : "N/A"}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      resultData?.isPassed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {resultData?.isPassed ? "✓ Đạt yêu cầu" : "✗ Chưa đạt"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleViewDetail}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#ffd803] hover:bg-[#ffd803]/90 text-[#272343] text-sm font-medium rounded-lg transition-colors border border-[#272343] shadow-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Xem lại bài làm
                </button>
                <button
                  onClick={handleRetakeQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 border-2 border-[#272343]/40 text-[#272343] text-sm font-medium rounded-lg hover:bg-[#fffffe]/50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm lại bài kiểm tra
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Result Detail Drawer */}
      {showResultDetail && (
        <QuizResultDetail
          submissionId={quiz.quizSubmissionId}
          onClose={() => setShowResultDetail(false)}
        />
      )}
    </>
  );
};

export default QuizView;
