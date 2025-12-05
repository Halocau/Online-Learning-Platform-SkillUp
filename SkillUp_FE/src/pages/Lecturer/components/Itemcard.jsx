import { useState } from "react";
import {
  Video,
  FileText,
  HelpCircle,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LessonForm from "./LessonForm";
import QuizForm from "../Quiz/Quizform";
import QuizQuestionManager from "../Quiz/QuizQuestionManager";

function ItemCard({
  item,
  onEdit,
  onDelete,
  isEditing,
  editForm,
  setEditForm,
  onUpdate,
  onCancelEdit,
  courseId,
  sectionId,
  onRefreshCourse,
}) {
  const isLesson = item.kind === "Lesson";
  const isQuiz = item.kind === "Quiz";

  const [showQuestions, setShowQuestions] = useState(false);

  // Lesson Display
  if (isLesson && !isEditing) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded">
                {item.lessonType === "Video" ? (
                  <Video className="w-4 h-4 text-blue-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {item.lessonType}
                  </span>
                  {item.isFree && (
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                      Miễn phí
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => onEdit(item)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDelete(item.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Lesson Edit Form
  if (isLesson && isEditing) {
    return (
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-3">
          <LessonForm
            lessonForm={editForm}
            setLessonForm={setEditForm}
            onSave={() => onUpdate(item.id)}
            onCancel={onCancelEdit}
            loading={false}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    );
  }

  // Quiz Display
  if (isQuiz && !isEditing) {
    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-3">
          {/* Quiz Header - Clickable like SectionCard */}
          <div
            className="flex items-start gap-3 mb-3 cursor-pointer hover:bg-orange-50/50 -mx-3 -mt-3 px-3 pt-3 pb-3 rounded-t transition-colors"
            onClick={() => setShowQuestions(!showQuestions)}
          >
            <div className="p-2 bg-orange-100 rounded flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-orange-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded">
                  Điểm đạt: {item.passPercent}%
                </span>
                <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded">
                  {item.timer} phút
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 hover:bg-orange-200 rounded text-orange-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {showQuestions ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Collapsible Quiz Question Manager */}
          {showQuestions && (
            <QuizQuestionManager
              quiz={item}
              courseId={courseId}
              sectionId={sectionId}
              onUpdate={onRefreshCourse}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Quiz Edit Form
  if (isQuiz && isEditing) {
    return (
      <Card className="border-l-4 border-l-orange-500 bg-orange-50">
        <CardContent className="p-3">
          <QuizForm
            quizForm={editForm}
            setQuizForm={setEditForm}
            onSave={() => onUpdate(item.id)}
            onCancel={onCancelEdit}
            loading={false}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default ItemCard;
