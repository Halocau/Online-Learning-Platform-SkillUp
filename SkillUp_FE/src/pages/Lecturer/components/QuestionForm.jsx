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
import RichTextEditor from "@/components/Editor/RichText";
import { extractCleanText } from "@/utils/htmlUtils";

function QuestionForm({ onSave, onCancel, loading, initialData, isEditMode }) {
  const titleEditorRef = useRef(null);
  const answerEditorRefs = useRef([]);

  // Lazy state initialization - initialize FROM initialData on first render
  const [questionData, setQuestionData] = useState(() => {
    if (initialData) {
      const newAnswers = (
        initialData.answers || [
          { answerName: "", isCorrect: false, imageUrl: "" },
          { answerName: "", isCorrect: false, imageUrl: "" },
        ]
      ).map((ans) => {
        const answerText =
          ans.answerName || ans.answerText || ans.text || ans.answer || "";
        return {
          answerId: ans.answerId || ans.id,
          answerName: answerText,
          isCorrect: ans.isCorrect || false,
          imageUrl: ans.imageUrl || ans.image || "",
        };
      });

      return {
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "SingleChoice",
        imageUrl: initialData.imageUrl || "",
        answers: newAnswers,
        orders: initialData.orders || 0,
      };
    }

    // Default state for new questions
    return {
      title: "",
      description: "",
      type: "SingleChoice",
      imageUrl: "",
      answers: [
        { answerName: "", isCorrect: false, imageUrl: "" },
        { answerName: "", isCorrect: false, imageUrl: "" },
      ],
      orders: 0,
    };
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageUrl || null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Track answer images
  const [answerImageFiles, setAnswerImageFiles] = useState({});
  const [answerImagePreviews, setAnswerImagePreviews] = useState(() => {
    const previews = {};
    if (initialData?.answers) {
      initialData.answers.forEach((ans, idx) => {
        if (ans.imageUrl || ans.image) {
          previews[idx] = ans.imageUrl || ans.image;
        }
      });
    }
    return previews;
  });
  const [uploadingAnswerImage, setUploadingAnswerImage] = useState({});

  // Track which answer editor is currently open
  const [activeAnswerEditor, setActiveAnswerEditor] = useState(null);

  // Only use useEffect for setting editor content (CKEditor needs to be ready first)
  useEffect(() => {
    if (titleEditorRef.current && initialData?.title) {
      setTimeout(() => {
        if (
          titleEditorRef.current &&
          typeof titleEditorRef.current.setData === "function"
        ) {
          titleEditorRef.current.setData(initialData.title);
        }
      }, 100);
    }
  }, [initialData?.title]);

  const handleTypeChange = (newType) => {
    const updatedAnswers = questionData.answers.map((answer) => {
      if (newType === "SingleChoice") {
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

  // Answer image handlers
  const handleAnswerImageSelect = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswerImageFiles((prev) => ({ ...prev, [index]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswerImagePreviews((prev) => ({ ...prev, [index]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAnswerImage = (index) => {
    setAnswerImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setAnswerImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });

    const newAnswers = [...questionData.answers];
    newAnswers[index].imageUrl = "";
    setQuestionData({ ...questionData, answers: newAnswers });
  };

  const handleAddAnswer = () => {
    if (questionData.answers.length < 7) {
      setQuestionData({
        ...questionData,
        answers: [
          ...questionData.answers,
          { answerName: "", isCorrect: false, imageUrl: "" },
        ],
      });
    }
  };

  const handleRemoveAnswer = (index) => {
    if (questionData.answers.length > 2) {
      const newAnswers = questionData.answers.filter((_, i) => i !== index);
      setQuestionData({ ...questionData, answers: newAnswers });

      setAnswerImageFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
      setAnswerImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });

      if (activeAnswerEditor === index) {
        setActiveAnswerEditor(null);
      }
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

  const toggleAnswerEditor = (index) => {
    if (activeAnswerEditor === index) {
      setActiveAnswerEditor(null);
    } else {
      setActiveAnswerEditor(index);
    }
  };

  const handleSubmit = async () => {
    const editorContent = titleEditorRef.current
      ? titleEditorRef.current.getData()
      : questionData.title;

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

    // Upload answer images
    const finalAnswers = await Promise.all(
      questionData.answers.map(async (answer, index) => {
        let answerImageUrl = answer.imageUrl;

        if (answerImageFiles[index]) {
          setUploadingAnswerImage((prev) => ({ ...prev, [index]: true }));
          answerImageUrl = await uploadQuestionImage(answerImageFiles[index]);
          setUploadingAnswerImage((prev) => ({ ...prev, [index]: false }));

          if (!answerImageUrl) {
            answerImageUrl = answer.imageUrl; // Keep old URL if upload fails
          }
        }

        return {
          ...answer,
          imageUrl: answerImageUrl || "",
        };
      })
    );

    onSave({
      ...questionData,
      title: editorContent || questionData.title,
      imageUrl: finalImageUrl || "",
      answers: finalAnswers,
    });
  };

  const isSingle = questionData.type === "SingleChoice";
  const isUploading =
    uploadingImage || Object.values(uploadingAnswerImage).some((v) => v);

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

        {/* Question Title with RichTextEditor */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
            Câu hỏi <span className="text-red-500">*</span>
          </label>
          <div className="border border-[#272343]/15 rounded-lg overflow-hidden">
            <RichTextEditor
              value={questionData.title}
              onChange={(data) =>
                setQuestionData({ ...questionData, title: data })
              }
              onReady={(editor) => {
                titleEditorRef.current = editor;
                // Set data after editor is ready, with delay to ensure editor is fully initialized
                if (initialData?.title) {
                  setTimeout(() => {
                    if (editor && typeof editor.setData === "function") {
                      editor.setData(initialData.title);
                    }
                  }, 100);
                }
              }}
              placeholder="Nhập câu hỏi của bạn..."
              minHeight={250}
              maxHeight={500}
            />
          </div>
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

        {/* Question Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#272343]">
            Hình ảnh câu hỏi (tùy chọn)
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
          <div className="space-y-3">
            {questionData.answers.map((answer, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type={isSingle ? "radio" : "checkbox"}
                    name={
                      isSingle ? "correct-answer" : `correct-answer-${index}`
                    }
                    checked={answer.isCorrect}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className="w-4 h-4 mt-3 accent-[#FFD54F] flex-shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    {/* Answer Text/Editor Toggle */}
                    <div className="flex items-center gap-2">
                      {activeAnswerEditor === index ? (
                        <div className="flex-1 border border-[#272343]/15 rounded-lg overflow-hidden">
                          <RichTextEditor
                            value={answer.answerName}
                            onChange={(data) =>
                              handleAnswerChange(index, "answerName", data)
                            }
                            onReady={(editor) => {
                              answerEditorRefs.current[index] = editor;
                              if (answer.answerName) {
                                editor.setData(answer.answerName);
                              }
                            }}
                            placeholder={`Đáp án ${index + 1}`}
                            minHeight={150}
                            maxHeight={300}
                          />
                        </div>
                      ) : (
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={extractCleanText(
                              answer.answerName || "",
                              100
                            )}
                            onClick={() => toggleAnswerEditor(index)}
                            placeholder={`Đáp án ${
                              index + 1
                            } (click để dùng editor)`}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent cursor-pointer ${
                              answer.answerName
                                ? "border-[#272343]/15 text-[#272343]"
                                : "border-[#272343]/10 text-gray-400"
                            }`}
                            readOnly
                          />
                          {answer.answerName && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                              ✓
                            </span>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() => toggleAnswerEditor(index)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        title={
                          activeAnswerEditor === index
                            ? "Đóng editor"
                            : "Mở editor"
                        }
                      >
                        {activeAnswerEditor === index ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Answer Image Upload */}
                    <div className="ml-6">
                      {!answerImagePreviews[index] ? (
                        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#272343]/20 rounded-lg hover:border-[#FFD54F] hover:bg-[#FFD54F]/5 cursor-pointer transition-colors text-sm">
                          <ImageIcon className="w-4 h-4 text-[#2d334a]" />
                          <span className="text-[#2d334a]">
                            Thêm ảnh cho đáp án
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAnswerImageSelect(index, e)}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative inline-block">
                          <img
                            src={answerImagePreviews[index]}
                            alt={`Answer ${index + 1}`}
                            className="max-h-32 object-contain rounded-lg border border-[#272343]/15"
                          />
                          <Button
                            onClick={() => handleRemoveAnswerImage(index)}
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 bg-white/90 hover:bg-white shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {questionData.answers.length > 2 && (
                    <Button
                      onClick={() => handleRemoveAnswer(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
            disabled={loading || isUploading}
            className="bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold"
          >
            {isUploading ? (
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
            disabled={loading || isUploading}
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
