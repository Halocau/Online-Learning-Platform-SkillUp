// src/pages/Lecturer/components/QuestionForm.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  Check,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadQuestionImage } from "@/api/questionAPI";

function QuestionForm({ onSave, onCancel, loading, initialData, isEditMode }) {
  const [questionData, setQuestionData] = useState({
    title: "",
    description: "",
    type: "SingleChoice",
    imageUrl: "",
    answers: [
      { answerName: "", isCorrect: false },
      { answerName: "", isCorrect: false },
    ],
    orders: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setQuestionData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "SingleChoice",
        imageUrl: initialData.imageUrl || "",
        answers: initialData.answers || [
          { answerName: "", isCorrect: false },
          { answerName: "", isCorrect: false },
        ],
        orders: initialData.orders || 0,
      });

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setQuestionData({ ...questionData, imageUrl: "" });
  };

  const handleAddAnswer = () => {
    if (questionData.answers.length < 6) {
      setQuestionData({
        ...questionData,
        answers: [
          ...questionData.answers,
          { answerName: "", isCorrect: false },
        ],
      });
    }
  };

  const handleRemoveAnswer = (index) => {
    if (questionData.answers.length > 2) {
      const newAnswers = questionData.answers.filter((_, i) => i !== index);
      setQuestionData({ ...questionData, answers: newAnswers });
    }
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...questionData.answers];
    newAnswers[index][field] = value;
    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleCorrectAnswerChange = (index) => {
    const isSingle = questionData.type === "SingleChoice";
    let newAnswers;

    if (isSingle) {
      newAnswers = questionData.answers.map((answer, i) => ({
        ...answer,
        isCorrect: i === index,
      }));
    } else {
      newAnswers = questionData.answers.map((answer, i) =>
        i === index ? { ...answer, isCorrect: !answer.isCorrect } : answer
      );
    }

    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleSubmit = async () => {
    // Validation
    if (!questionData.title.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    if (questionData.answers.some((a) => !a.answerName.trim())) {
      alert("Vui lòng điền đầy đủ các đáp án");
      return;
    }

    if (!questionData.answers.some((a) => a.isCorrect)) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }

    let finalImageUrl = questionData.imageUrl;
    if (imageFile) {
      setUploadingImage(true);
      finalImageUrl = await uploadQuestionImage(imageFile);
      setUploadingImage(false);

      if (!finalImageUrl) {
        return;
      }
    }

    onSave({
      ...questionData,
      imageUrl: finalImageUrl || "",
    });
  };

  const isSingle = questionData.type === "SingleChoice";

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {isEditMode ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          </h3>
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
          <label className="block text-sm font-medium mb-1">
            Câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={questionData.title}
            onChange={(e) =>
              setQuestionData({ ...questionData, title: e.target.value })
            }
            placeholder="Nhập câu hỏi..."
            rows="2"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Question Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Mô tả / Gợi ý (tùy chọn)
          </label>
          <input
            type="text"
            value={questionData.description}
            onChange={(e) =>
              setQuestionData({ ...questionData, description: e.target.value })
            }
            placeholder="Thêm mô tả hoặc gợi ý..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Loại câu hỏi</label>
          <select
            value={questionData.type}
            onChange={(e) =>
              setQuestionData({ ...questionData, type: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="SingleChoice">Một đáp án đúng</option>
            <option value="MultiChoice">Nhiều đáp án đúng</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Hình ảnh (tùy chọn)
          </label>

          {!imagePreview ? (
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Tải lên hình ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded-lg border"
              />
              <Button
                onClick={handleRemoveImage}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Answers */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Đáp án <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {questionData.answers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type={isSingle ? "radio" : "checkbox"}
                  name={isSingle ? "correct-answer" : `correct-answer-${index}`}
                  checked={answer.isCorrect}
                  onChange={() => handleCorrectAnswerChange(index)}
                  className="w-4 h-4 text-orange-600"
                />
                <input
                  type="text"
                  value={answer.answerName}
                  onChange={(e) =>
                    handleAnswerChange(index, "answerName", e.target.value)
                  }
                  placeholder={`Đáp án ${index + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
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

          {questionData.answers.length < 6 && (
            <Button
              onClick={handleAddAnswer}
              variant="outline"
              size="sm"
              className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm đáp án
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tải ảnh...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                {isEditMode ? "Cập nhật" : "Tạo câu hỏi"}
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={loading || uploadingImage}
          >
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionForm;
