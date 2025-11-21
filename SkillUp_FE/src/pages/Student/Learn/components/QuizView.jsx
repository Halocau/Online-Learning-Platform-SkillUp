import { useState } from "react";
import {
  PlayCircle,
  Clock,
  Target,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuizView = ({ quiz, onComplete, isCompleted }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  // Mock questions - replace with actual API data
  const mockQuestions = [
    {
      id: 1,
      question: "React là gì?",
      options: [
        "Thư viện JavaScript",
        "Ngôn ngữ lập trình",
        "Cơ sở dữ liệu",
        "Hệ điều hành",
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: "Ngôn ngữ lập trình nào được sử dụng trong khóa học này?",
      options: ["Python", "JavaScript", "C#", "Java"],
      correctAnswer: 2,
    },
  ];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setScore(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
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

  // Already completed view
  if (isCompleted && !quizStarted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Trophy className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Đã hoàn thành!
        </h3>
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
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <PlayCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Sẵn sàng kiểm tra?
          </h3>
          <p className="text-gray-600">
            Đánh giá kiến thức của bạn về nội dung đã học
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
            <p className="text-lg font-bold text-gray-900">
              {quiz.passPercent}%
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <CheckCircle2 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Câu hỏi</p>
            <p className="text-lg font-bold text-gray-900">
              {mockQuestions.length}
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
  }

  // Results screen
  if (quizCompleted) {
    const passed = score >= quiz.passPercent;

    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
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

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? "Chúc mừng!" : "Hãy thử lại!"}
        </h3>

        <p className="text-xl text-gray-600 mb-6">Điểm: {score}%</p>

        <div className="max-w-md mx-auto mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all",
                passed ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Cần {quiz.passPercent}% để đạt
          </p>
        </div>

        <button
          onClick={handleStartQuiz}
          className="px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
        >
          Làm lại
        </button>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = mockQuestions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Câu {currentQuestionIndex + 1} / {mockQuestions.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD54F] transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        {currentQuestion.question}
      </h3>

      {/* Options */}
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
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  selectedAnswers[currentQuestion.id] === index
                    ? "border-[#FFD54F] bg-[#FFD54F]"
                    : "border-gray-300"
                )}
              >
                {selectedAnswers[currentQuestion.id] === index && (
                  <div className="w-2 h-2 rounded-full bg-gray-900" />
                )}
              </div>
              <span className="text-gray-900">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() =>
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
          }
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Câu trước
        </button>

        {currentQuestionIndex === mockQuestions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="px-6 py-2.5 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
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
            className="px-6 py-2.5 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
          >
            Câu tiếp theo
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;