// src/pages/Lecturer/components/QuestionDetailModal.jsx
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function QuestionDetailModal({ isOpen, onClose, question }) {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272343]/10 bg-[#FFD54F]/10">
          <h2 className="text-xl font-bold text-[#272343]">Chi tiết câu hỏi</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-[#e3f6f5]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#272343]">
              Câu hỏi
            </label>
            <div
              className="prose prose-sm max-w-none p-4 bg-[#FFD54F]/5 rounded-lg border border-[#272343]/10"
              dangerouslySetInnerHTML={{ __html: question.title }}
            />
          </div>

          {/* Question Description */}
          {question.description && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#272343]">
                Mô tả / Gợi ý
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-[#2d334a]">
                {question.description}
              </p>
            </div>
          )}

          {/* Question Type & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#272343]">
                Loại câu hỏi
              </label>
              <span className="inline-block px-3 py-1. 5 bg-[#FFD54F]/20 text-[#272343] rounded-lg text-sm font-medium">
                {question. type === "SingleChoice"
                  ? "Một đáp án đúng"
                  : "Nhiều đáp án đúng"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#272343]">
                Thứ tự
              </label>
              <span className="inline-block px-3 py-1.5 bg-[#e3f6f5] text-[#2d334a] rounded-lg text-sm font-medium">
                #{question.orders || 1}
              </span>
            </div>
          </div>

          {/* Question Image */}
          {question.imageUrl && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#272343]">
                Hình ảnh câu hỏi
              </label>
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-h-64 rounded-lg border border-[#272343]/15 object-contain"
              />
            </div>
          )}

          {/* Answers */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-[#272343]">
              Đáp án ({question.answers?.length || 0})
            </label>
            <div className="space-y-3">
              {question.answers && question.answers.length > 0 ? (
                question.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      answer. isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-[#272343]/10 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Correct indicator */}
                      <div className="flex-shrink-0 mt-1">
                        {answer.isCorrect ?  (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>

                      {/* Answer content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-[#272343]">
                            Đáp án {index + 1}
                          </span>
                          {answer.isCorrect && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                              Đáp án đúng
                            </span>
                          )}
                        </div>

                        {/* Answer text */}
                        <div
                          className="prose prose-sm max-w-none text-[#2d334a]"
                          dangerouslySetInnerHTML={{ __html: answer.answerName }}
                        />

                        {/* Answer image */}
                        {answer. imageUrl && (
                          <div className="mt-3">
                            <img
                              src={answer.imageUrl}
                              alt={`Answer ${index + 1}`}
                              className="max-h-40 rounded-lg border border-[#272343]/15 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có đáp án</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#272343]/10 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetailModal;