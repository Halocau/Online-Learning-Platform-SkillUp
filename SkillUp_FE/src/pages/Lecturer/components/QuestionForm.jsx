// src/pages/Lecturer/components/QuestionForm.jsx
import { useState, useEffect, useRef } from "react";
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
import { Editor } from "@tinymce/tinymce-react";

function QuestionForm({ onSave, onCancel, loading, initialData, isEditMode }) {
  const editorRef = useRef(null);

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

  // Handle question type change - properly reset answer states
  const handleTypeChange = (newType) => {
    const updatedAnswers = questionData.answers.map((answer) => {
      if (newType === "SingleChoice") {
        // When switching to single choice, keep only first correct answer
        return { ...answer, isCorrect: false };
      }
      return answer;
    });

    setQuestionData({
      ...questionData,
      type: newType,
      answers: updatedAnswers,
    });
  };

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
      // Single choice: only one can be correct
      newAnswers = questionData.answers.map((answer, i) => ({
        ...answer,
        isCorrect: i === index,
      }));
    } else {
      // Multiple choice: toggle the selected one
      newAnswers = questionData.answers.map((answer, i) =>
        i === index ? { ...answer, isCorrect: !answer.isCorrect } : answer
      );
    }

    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleSubmit = async () => {
    // Get content from TinyMCE editor
    const editorContent = editorRef.current
      ? editorRef.current.getContent()
      : questionData.title;

    // Validation
    if (!editorContent.trim() && !questionData.title.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    if (questionData.answers.some((a) => !a.answerName.trim())) {
      alert("Vui lòng điền đầy đủ các đáp án");
      return;
    }

    if (!questionData.answers.some((a) => a.isCorrect)) {
      alert("Vui lòng chọn ít nhất một đáp án đúng");
      return;
    }

    // Validate answer type consistency
    const correctAnswersCount = questionData.answers.filter(
      (a) => a.isCorrect
    ).length;
    if (questionData.type === "SingleChoice" && correctAnswersCount > 1) {
      alert("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng");
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
      title: editorContent || questionData.title,
      imageUrl: finalImageUrl || "",
    });
  };

  const isSingle = questionData.type === "SingleChoice";

  return (
    <Card className="border-2 border-[#FFD54F]/40 bg-[#FFD54F]/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#272343]">
            {isEditMode ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          </h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-[#e3f6f5]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Question Title with TinyMCE */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
            Câu hỏi <span className="text-red-500">*</span>
          </label>
          <div className="border border-[#272343]/15 rounded-lg overflow-hidden">
            <Editor
              apiKey="tv8otnk3960gtkqgy0sdo1csb22swjvc7bgco353p0967x7i" 
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={questionData.title}
              init={{
                height: 200,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "preview",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic forecolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | code | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                skin: "oxide",
                content_css: "default",
              }}
            />
          </div>
          <p className="text-xs text-[#2d334a] mt-1">
            Sử dụng trình soạn thảo để định dạng câu hỏi, thêm công thức, hình
            ảnh, v.v.
          </p>
        </div>

        {/* Question Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#272343]">
            Mô tả / Gợi ý (tùy chọn)
          </label>
          <input
            type="text"
            value={questionData.description}
            onChange={(e) =>
              setQuestionData({ ...questionData, description: e.target.value })
            }
            placeholder="Thêm mô tả hoặc gợi ý..."
            className="w-full px-3 py-2 border border-[#272343]/15 rounded-lg focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
            Loại câu hỏi <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("SingleChoice")}
              className={`p-3 border-2 rounded-lg transition-all ${
                questionData.type === "SingleChoice"
                  ? "border-[#FFD54F] bg-[#FFD54F]/10 shadow-sm"
                  : "border-[#272343]/15 hover:border-[#FFD54F]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={questionData.type === "SingleChoice"}
                  onChange={() => handleTypeChange("SingleChoice")}
                  className="w-4 h-4 accent-[#FFD54F]"
                />
                <span className="text-sm font-medium text-[#272343]">
                  Một đáp án đúng
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("MultiChoice")}
              className={`p-3 border-2 rounded-lg transition-all ${
                questionData.type === "MultiChoice"
                  ? "border-[#FFD54F] bg-[#FFD54F]/10 shadow-sm"
                  : "border-[#272343]/15 hover:border-[#FFD54F]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={questionData.type === "MultiChoice"}
                  onChange={() => handleTypeChange("MultiChoice")}
                  className="w-4 h-4 accent-[#FFD54F]"
                />
                <span className="text-sm font-medium text-[#272343]">
                  Nhiều đáp án đúng
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
            Hình ảnh (tùy chọn)
          </label>

          {!imagePreview ? (
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#272343]/20 rounded-lg hover:border-[#FFD54F] hover:bg-[#FFD54F]/5 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-[#2d334a]" />
              <span className="text-sm text-[#2d334a]">Tải lên hình ảnh</span>
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
                className="w-full max-h-48 object-contain rounded-lg border border-[#272343]/15"
              />
              <Button
                onClick={handleRemoveImage}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Answers */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
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
                  className="w-4 h-4 accent-[#FFD54F]"
                />
                <input
                  type="text"
                  value={answer.answerName}
                  onChange={(e) =>
                    handleAnswerChange(index, "answerName", e.target.value)
                  }
                  placeholder={`Đáp án ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-[#272343]/15 rounded-lg focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent"
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
              className="mt-2 text-[#272343] border-[#272343]/15 hover:bg-[#e3f6f5]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm đáp án
            </Button>
          )}

          <p className="text-xs text-[#2d334a] mt-2">
            {isSingle
              ? "Chọn 1 đáp án đúng bằng cách nhấn vào nút radio"
              : "Chọn nhiều đáp án đúng bằng cách tích vào checkbox"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#272343]/10">
          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold"
          >
            {uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#272343] mr-2"></div>
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
            className="border-[#272343]/15 hover:bg-[#e3f6f5]"
          >
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionForm;
