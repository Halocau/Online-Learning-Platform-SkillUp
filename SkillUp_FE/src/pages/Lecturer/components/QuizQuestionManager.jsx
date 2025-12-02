import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  addQuestionToQuiz,
  addQuestionsFromBank,
  updateQuestion,
  deleteQuestionFromQuiz,
} from "@/api/questionAPI";
import { getQuizById } from "@/api/quizAPI";
import { toast } from "react-toastify";
import QuestionForm from "./QuestionForm";
import QuestionBankSelector from "./QuestionBankSelector";
import { extractCleanText } from "@/utils/htmlUtils";

const getQuestionId = (question) =>
  question?.id ?? question?.questionId ?? question?.questionID ?? null;

const pickQuestionFromCreateResult = (result) => {
  if (!result) return null;

  if (Array.isArray(result)) {
    return result[0] ?? null;
  }

  if (typeof result === "object") {
    if (Array.isArray(result.data)) {
      return result.data[0] ?? null;
    }
    if (result.data && typeof result.data === "object") {
      return result.data;
    }
  }

  return result;
};

const pickQuestionFromUpdateResult = (result) => {
  if (!result) return null;

  const data = result.data ?? result.question ?? null;

  if (Array.isArray(data)) return data[0] ?? null;
  if (data && typeof data === "object") return data;

  return null;
};

function QuizQuestionManager({ quiz, courseId, sectionId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [addingMode, setAddingMode] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [quiz.id]);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);

      const quizData = await getQuizById(quiz.id);

      let questionsList = [];

      if (Array.isArray(quizData)) {
        if (quizData.length > 0) {
          questionsList = quizData[0]?.questions || [];
        }
      } else if (quizData?.questions) {
        questionsList = quizData.questions;
      } else if (Array.isArray(quizData?.data)) {
        if (quizData.data.length > 0) {
          questionsList = quizData.data[0]?.questions || [];
        }
      }

      questionsList = questionsList.map((q) => ({
        id: q.questionId || q.id || q.questionID,
        questionId: q.questionId || q.id || q.questionID,

        title: q.title || "",
        description: q.description || "",
        type: q.type || "SingleChoice",
        orders: q.orders || 0,

        imageUrl: q.image || q.imageUrl || "",

        answers: (q.answers || []).map((ans) => ({
          answerId: ans.answerId || ans.id,
          id: ans.answerId || ans.id,
          answerName: ans.answerName || "",
          isCorrect: ans.isCorrect ?? false,
          imageUrl: ans.imageUrl || ans.image || "",
        })),
      }));
      setQuestions(questionsList);
    } catch (error) {
      console.error("❌ Error loading questions:", error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAddManualQuestion = async (questionData) => {
    setLoading(true);
    try {
      const maxOrder =
        questions.length > 0
          ? Math.max(...questions.map((q) => q.orders || 0))
          : 0;

      const payload = {
        quizId: quiz.id,
        title: questionData.title,
        description: questionData.description,
        orders: maxOrder + 1,
        imageUrl: questionData.imageUrl || "",
        type: questionData.type || "SingleChoice",
        answers: questionData.answers.map((ans) => ({
          answerName: ans.answerName,
          isCorrect: ans.isCorrect,
          imageUrl: ans.imageUrl || "",
        })),
      };

      const result = await addQuestionToQuiz(payload);

      if (result !== null) {
        const apiQuestion = pickQuestionFromCreateResult(result);
        const newQuestion = {
          ...(apiQuestion || {}),
          ...payload,
        };

        newQuestion.orders = newQuestion.orders ?? maxOrder + 1;

        setQuestions((prev) => [...prev, newQuestion]);
        setAddingMode(null);
        toast.success("Câu hỏi đã được tạo thành công!");
      }
    } catch (error) {
      console.error("❌ Error adding question:", error);
      toast.error(error.message || "Lỗi khi tạo câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromBank = async (selectedQuestionIds) => {
    setLoading(true);
    try {
      const maxOrder =
        questions.length > 0
          ? Math.max(...questions.map((q) => q.orders || 0))
          : 0;

      const questionsToAdd = selectedQuestionIds.map(
        (questionBankId, index) => ({
          questionBankId,
          quizId: quiz.id,
          orders: maxOrder + index + 1,
        })
      );

      const result = await addQuestionsFromBank(questionsToAdd);

      if (result !== null) {
        await loadQuestions();
        setAddingMode(null);
        toast.success("Câu hỏi đã được thêm từ ngân hàng!");
      }
    } catch (error) {
      console.error("❌ Error adding questions from bank:", error);
      toast.error(error.message || "Lỗi khi thêm câu hỏi từ ngân hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    const id = getQuestionId(question);
    if (!id) {
      toast.error("Không thể chỉnh sửa: Không tìm thấy ID câu hỏi");
      return;
    }

    setEditingQuestionId(id);
  };

  // Memoize the initial data for the editing question to prevent unnecessary re-renders
  const editingQuestionData = useMemo(() => {
    if (!editingQuestionId) return null;

    const question = questions.find(
      (q) => getQuestionId(q) === editingQuestionId
    );
    if (!question) {
      return null;
    }

    return {
      title: question.title || "",
      description: question.description || "",
      type: question.type || "SingleChoice",
      imageUrl: question.imageUrl || "",
      answers:
        question.answers && question.answers.length > 0
          ? question.answers.map((ans) => ({
              answerId: ans.answerId || ans.id, // CRITICAL: Include answerId for updates
              answerName: ans.answerName || "",
              isCorrect: ans.isCorrect ?? false,
              imageUrl: ans.imageUrl || "",
            }))
          : [
              { answerName: "", isCorrect: false, imageUrl: "" },
              { answerName: "", isCorrect: false, imageUrl: "" },
            ],
      orders: question.orders || 0,
    };
  }, [editingQuestionId, questions]);

  const handleUpdateQuestion = async (questionData) => {
    if (!editingQuestionId) {
      toast.error("Không tìm thấy ID câu hỏi để cập nhật!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        quizId: quiz.id,
        title: questionData.title,
        description: questionData.description,
        orders: questionData.orders,
        imageUrl: questionData.imageUrl || "",
        type: questionData.type || "SingleChoice",
        answers: questionData.answers.map((ans) => ({
          answerName: ans.answerName,
          isCorrect: ans.isCorrect,
          imageUrl: ans.imageUrl || "",
        })),
      };

      const result = await updateQuestion(editingQuestionId, payload);

      if (result !== null) {
        const apiQuestion = pickQuestionFromUpdateResult(result);

        setQuestions((prev) =>
          prev.map((q) => {
            if (getQuestionId(q) !== editingQuestionId) return q;

            return {
              ...q,
              ...(apiQuestion || {}),
              ...payload,
            };
          })
        );

        setEditingQuestionId(null);
        toast.success("Câu hỏi đã được cập nhật!");
      }
    } catch (error) {
      console.error("❌ Error updating question:", error);
      toast.error(error.message || "Lỗi khi cập nhật câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId) return;

    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      return;
    }

    try {
      setLoading(true);

      // Call the actual delete API
      await deleteQuestionFromQuiz(quiz.id, questionId);

      // Remove from local state after successful API call
      setQuestions((prev) =>
        prev.filter((q) => getQuestionId(q) !== questionId)
      );

      toast.success("Câu hỏi đã được xóa!");
    } catch (err) {
      console.error("❌ Error deleting question:", err);
      toast.error("Lỗi khi xóa câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // Count answers with images
  const countAnswerImages = (answers) => {
    if (!answers || !Array.isArray(answers)) return 0;
    return answers.filter((ans) => ans.imageUrl || ans.image).length;
  };

  // Debug log when editingQuestionId changes
  useEffect(() => {
    if (editingQuestionId) {
      const question = questions.find(
        (q) => getQuestionId(q) === editingQuestionId
      );
    }
  }, [editingQuestionId, questions]);

  return (
    <div className="mt-3 space-y-3">
      {/* Add Question Button */}
      {!addingMode && (
        <Button
          onClick={() => setAddingMode("bank")}
          size="sm"
          variant="outline"
          className="border-[#FFD54F]/30 text-[#272343] hover:bg-[#FFD54F]/10 rounded-full"
          disabled={loading || loadingQuestions}
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm câu hỏi
        </Button>
      )}

      {/* Question Bank Selector */}
      {addingMode === "bank" && (
        <QuestionBankSelector
          courseId={courseId}
          sectionId={sectionId}
          onAddFromBank={handleAddFromBank}
          onSwitchToManual={() => setAddingMode("manual")}
          onCancel={() => setAddingMode(null)}
          loading={loading}
        />
      )}

      {/* Manual Question Form */}
      {addingMode === "manual" && (
        <QuestionForm
          onSave={handleAddManualQuestion}
          onCancel={() => setAddingMode(null)}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loadingQuestions && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD54F] mx-auto"></div>
          <p className="text-sm text-[#2d334a] mt-2">Đang tải câu hỏi...</p>
        </div>
      )}

      {/* Questions List - Simple Udemy Style */}
      {!loadingQuestions && questions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#272343] tracking-tight">
            Câu hỏi ({questions.length})
          </h4>
          {questions
            .sort((a, b) => (a.orders || 0) - (b.orders || 0))
            .map((question, index) => {
              const qId = getQuestionId(question) ?? index;
              const isEditing = editingQuestionId === qId;

              // Extract clean text from HTML title
              const cleanTitle = extractCleanText(question.title, 100);
              const answerImageCount = countAnswerImages(question.answers);

              return (
                <Card
                  key={qId}
                  className="overflow-hidden rounded-2xl border border-[#272343]/15"
                >
                  {/* Simple Question Display - Collapsed by default */}
                  {!isEditing && (
                    <div className="flex items-center gap-3 p-3 bg-[#FFD54F]/5">
                      {/* Order Number */}
                      <span className="flex items-center justify-center w-8 h-8 bg-[#FFD54F]/20 text-[#272343] rounded-full font-semibold text-xs flex-shrink-0">
                        #{question.orders || index + 1}
                      </span>

                      {/* Question Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-[#272343] truncate">
                          {cleanTitle}
                        </h5>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {question.type && (
                            <span className="text-xs px-2 py-0.5 bg-[#FFD54F]/20 text-[#272343] rounded-full">
                              Loại câu hỏi:{" "}
                              {question.type === "SingleChoice"
                                ? "Một đáp án"
                                : "Nhiều đáp án"}
                            </span>
                          )}
                          {/* {question.imageUrl && (
                            <span className="text-xs px-2 py-0.5 bg-[#e3f6f5] text-[#272343] rounded-full flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Có ảnh câu hỏi
                            </span>
                          )} */}
                          {question.answers && (
                            <span className="text-xs px-2 py-0.5 bg-[#e3f6f5] text-[#2d334a] rounded-full">
                              {question.answers.length} câu trả lời
                            </span>
                          )}
                          {/* {answerImageCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {answerImageCount} ảnh đáp án
                            </span>
                          )} */}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-2 hover:bg-[#FFD54F]/20 rounded-full text-[#272343] transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(qId)}
                          className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Form - Only shows when editing AND we have valid data */}
                  {isEditing &&
                    editingQuestionData &&
                    editingQuestionData.answers &&
                    editingQuestionData.answers.length > 0 && (
                      <CardContent className="p-3 bg-white">
                        <QuestionForm
                          key={`edit-${qId}`}
                          onSave={handleUpdateQuestion}
                          onCancel={handleCancelEdit}
                          loading={loading}
                          initialData={editingQuestionData}
                          isEditMode={true}
                        />
                      </CardContent>
                    )}
                </Card>
              );
            })}
        </div>
      )}

      {/* Empty State */}
      {!loadingQuestions && questions.length === 0 && !addingMode && (
        <div className="p-4 bg-[#e3f6f5]/40 rounded-2xl text-center border-2 border-dashed border-[#272343]/20">
          <p className="text-sm text-[#2d334a]">Chưa có câu hỏi nào</p>
          <p className="text-xs text-[#2d334a]/60 mt-1">
            Nhấn "Thêm câu hỏi" để bắt đầu
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizQuestionManager;
