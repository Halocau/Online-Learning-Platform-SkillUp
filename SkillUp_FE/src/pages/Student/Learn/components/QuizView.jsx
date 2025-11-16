import { useState } from "react";
import {
  PlayCircle,
  Clock,
  Target,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuizView = ({ quiz, onComplete, isCompleted }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timer * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // TODO: Replace with actual quiz data from API
  const mockQuestions = [
    {
      id: 1,
      question: "React là gì?",
      options: ["Thư viện JavaScript", "Ng ôn ngữ lập trình", "Cơ sở dữ liệu", "Hệ điều hành"],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: "Ngôn ngữ lập trình nào được sử dụng trong khóa học này?",
      options: ["Python", "JavaScript", "C#", "Java"],
      correctAnswer: 2,
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const handleSubmitQuiz = () => {
    const calculatedScore = 85; 
    setScore(calculatedScore);
    setQuizCompleted(true);

    const passed = calculatedScore >= quiz.passPercent;
    onComplete(passed);
  };

  if (isCompleted && !quizStarted) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <Trophy className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Đã hoàn thành bài kiểm tra!
        </h3>
        <p className="text-gray-600 mb-6">
          Bạn đã hoàn thành bài kiểm tra này. Làm tốt lắm!
        </p>
        <button
          onClick={handleStartQuiz}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Làm lại bài kiểm tra
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
            <PlayCircle className="w-10 h-10 text-purple-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Sẵn sàng kiểm tra kiến thức?
          </h3>

          <p className="text-gray-600 mb-8">
            Bài kiểm tra này sẽ giúp bạn đánh giá sự hiểu biết của mình về tài liệu.
            Hãy chắc chắn rằng bạn đã chuẩn bị trước khi bắt đầu!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Thời gian</p>
              <p className="text-lg font-bold text-gray-900">
                {quiz.timer} phút
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Điểm đạt</p>
              <p className="text-lg font-bold text-gray-900">
                {quiz.passPercent}%
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Số câu hỏi</p>
              <p className="text-lg font-bold text-gray-900">
                {mockQuestions.length}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Chức năng bài kiểm tra hiện đang được phát triển. 
              .
            </p>
          </div>

          <button
            onClick={handleStartQuiz}
            className="px-8 py-4 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Bắt đầu bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const passed = score >= quiz.passPercent;

    return (
      <div className="px-6 py-12 text-center">
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

        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {passed ? "Chúc mừng!" : "Hãy tiếp tục luyện tập!"}
        </h3>

        <p className="text-xl text-gray-600 mb-6">Điểm của bạn: {score}%</p>

        <div className="max-w-md mx-auto mb-8">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={cn(
                "h-4 rounded-full transition-all",
                passed
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Điểm đạt: {quiz.passPercent}%
          </p>
        </div>

        {passed ? (
          <p className="text-green-600 font-medium mb-6">
            Bạn đã vượt qua bài kiểm tra! Làm tốt lắm!
          </p>
        ) : (
          <p className="text-red-600 font-medium mb-6">
            Bạn cần {quiz.passPercent}% để đạt. Thử lại nhé!
          </p>
        )}

        <button
          onClick={handleStartQuiz}
          className="px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
        >
          Làm lại bài kiểm tra
        </button>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = mockQuestions[currentQuestionIndex];

  return (
    <div className="px-6 py-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Câu hỏi {currentQuestionIndex + 1} / {mockQuestions.length}
          </span>
          <div className="flex gap-1">
            {mockQuestions.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index === currentQuestionIndex
                    ? "bg-[#FFD54F]"
                    : selectedAnswers[mockQuestions[index].id] !== undefined
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              className={cn(
                "w-full p-4 text-left rounded-lg border-2 transition-all",
                selectedAnswers[currentQuestion.id] === index
                  ? "border-[#FFD54F] bg-[#FFF9E6]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedAnswers[currentQuestion.id] === index
                      ? "border-[#FFD54F] bg-[#FFD54F]"
                      : "border-gray-300"
                  )}
                >
                  {selectedAnswers[currentQuestion.id] === index && (
                    <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  )}
                </div>
                <span className="font-medium text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Câu trước
          </button>

          {currentQuestionIndex === mockQuestions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestionIndex(
                  Math.min(mockQuestions.length - 1, currentQuestionIndex + 1)
                )
              }
              className="px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
            >
              Câu tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;