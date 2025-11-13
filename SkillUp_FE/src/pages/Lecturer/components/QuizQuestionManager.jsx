// src/pages/Lecturer/components/QuizQuestionManager.jsx
// Minimal version - Add questions only, no display until endpoint is ready
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addQuestionToQuiz, addQuestionsFromBank } from "@/api/questionAPI";
import QuestionForm from "./QuestionForm";
import QuestionBankSelector from "./QuestionBankSelector";

function QuizQuestionManager({ quiz, courseId, sectionId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [addingMode, setAddingMode] = useState(null);

  const handleAddManualQuestion = async (questionData) => {
    setLoading(true);
    try {
      const result = await addQuestionToQuiz({
        quizId: quiz.id,
        title: questionData.title,
        description: questionData.description,
        answers: questionData.answers,
      });
      console.log("Manual add result:", result);
      if (result) {
        setAddingMode(null);
        console.log("Calling onUpdate to refresh course data");
        if (onUpdate) await onUpdate();
      }
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromBank = async (selectedQuestionIds) => {
    setLoading(true);
    try {
      const questionsToAdd = selectedQuestionIds.map(
        (questionBankId, index) => ({
          questionBankId,
          quizId: quiz.id,
          orders: index + 1,
        })
      );

      const result = await addQuestionsFromBank(questionsToAdd);
      console.log("Bank add result:", result);
      if (result) {
        setAddingMode(null);
        console.log("Calling onUpdate to refresh course data");
        if (onUpdate) await onUpdate();
      }
    } catch (error) {
      console.error("Error adding questions from bank:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {!addingMode && (
        <Button
          onClick={() => setAddingMode("bank")}
          size="sm"
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm câu hỏi
        </Button>
      )}

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

      {addingMode === "manual" && (
        <QuestionForm
          onSave={handleAddManualQuestion}
          onCancel={() => setAddingMode(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default QuizQuestionManager;
