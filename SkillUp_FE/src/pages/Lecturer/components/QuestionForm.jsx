// src/pages/Lecturer/components/QuestionForm.jsx
import { useState } from "react";
import { Plus, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function QuestionForm({ onSave, onCancel, loading }) {
  const [questionData, setQuestionData] = useState({
    title: "",
    description: "",
    answers: [
      { answerName: "", isCorrect: false },
      { answerName: "", isCorrect: false },
    ],
  });

  const handleAddAnswer = () => {
    setQuestionData({
      ...questionData,
      answers: [...questionData.answers, { answerName: "", isCorrect: false }],
    });
  };

  const handleRemoveAnswer = (index) => {
    if (questionData.answers.length <= 2) {
      return; // Keep at least 2 answers
    }
    const newAnswers = questionData.answers.filter((_, i) => i !== index);
    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...questionData.answers];
    newAnswers[index][field] = value;
    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleCorrectAnswerChange = (index) => {
    const newAnswers = questionData.answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleSubmit = () => {
    // Validation
    if (!questionData.title.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    const filledAnswers = questionData.answers.filter((a) =>
      a.answerName.trim()
    );
    if (filledAnswers.length < 2) {
      alert("Vui lòng nhập ít nhất 2 đáp án");
      return;
    }

    const hasCorrectAnswer = filledAnswers.some((a) => a.isCorrect);
    if (!hasCorrectAnswer) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }

    // Send only filled answers
    onSave({
      ...questionData,
      answers: filledAnswers,
    });
  };

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Thêm câu hỏi mới</h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Câu hỏi *
          </label>
          <textarea
            value={questionData.title}
            onChange={(e) =>
              setQuestionData({ ...questionData, title: e.target.value })
            }
            placeholder="Nhập câu hỏi..."
            rows="2"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Question Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả (không bắt buộc)
          </label>
          <textarea
            value={questionData.description}
            onChange={(e) =>
              setQuestionData({ ...questionData, description: e.target.value })
            }
            placeholder="Thêm mô tả hoặc gợi ý..."
            rows="2"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Answers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đáp án *
          </label>
          <div className="space-y-2">
            {questionData.answers.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={answer.isCorrect}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                </div>
                <input
                  type="text"
                  value={answer.answerName}
                  onChange={(e) =>
                    handleAnswerChange(index, "answerName", e.target.value)
                  }
                  placeholder={`Đáp án ${index + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                {questionData.answers.length > 2 && (
                  <Button
                    onClick={() => handleRemoveAnswer(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={handleAddAnswer}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={questionData.answers.length >= 6}
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm đáp án
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Chọn nút radio để đánh dấu đáp án đúng
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            Thêm câu hỏi
          </Button>
          <Button onClick={onCancel} variant="outline">
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionForm;
