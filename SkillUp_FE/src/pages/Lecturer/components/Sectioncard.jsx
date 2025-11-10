// src/pages/Lecturer/tabs/components/SectionCard.jsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ItemCard from "./ItemCard";
import ContentTypeSelector from "./ContentTypeSelector";
import LessonForm from "./LessonForm";
import QuizForm from "./QuizForm";

function SectionCard({
  section,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddContent,
  onSaveLesson,
  onSaveQuiz,
  onEditLesson,
  onUpdateLesson,
  onDeleteLesson,
  onEditQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  loading,
  // Edit states
  editingSectionId,
  sectionForm,
  setSectionForm,
  onUpdateSection,
  onCancelEditSection,
  // Add content states
  addingItemToSection,
  onSelectContentType,
  onCancelAddContent,
  lessonForm,
  setLessonForm,
  quizForm,
  setQuizForm,
  editingLessonId,
  setEditingLessonId,
  editingQuizId,
  setEditingQuizId,
}) {
  return (
    <Card className="overflow-hidden">
      {/* Section Header */}
      {editingSectionId === section.id ? (
        <div className="p-4 bg-yellow-50 border-b">
          <div className="space-y-2">
            <input
              type="text"
              value={sectionForm.title}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <textarea
              value={sectionForm.description}
              onChange={(e) =>
                setSectionForm({
                  ...sectionForm,
                  description: e.target.value,
                })
              }
              rows="2"
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => onUpdateSection(section.id)}
                size="sm"
                className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900"
              >
                <Check className="w-4 h-4 mr-1" />
                Lưu
              </Button>
              <Button onClick={onCancelEditSection} variant="outline" size="sm">
                <X className="w-4 h-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={onToggle}
        >
          <span className="flex items-center justify-center w-8 h-8 bg-[#FFD54F]/20 text-gray-900 rounded-full font-semibold text-sm">
            {section.orders || index + 1}
          </span>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {section.items?.length || 0} mục
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(section);
              }}
              className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
              className="p-2 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      )}

      {/* Section Content */}
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          {section.description && (
            <p className="text-sm text-gray-600 mb-3 p-3 bg-blue-50 rounded">
              {section.description}
            </p>
          )}

          {/* Items List */}
          <div className="space-y-2 mb-3">
            {section.items && section.items.length > 0 ? (
              section.items.map((item, itemIndex) => (
                <ItemCard
                  key={item.id || `item-${section.id}-${itemIndex}`}
                  item={item}
                  onEdit={item.kind === "Lesson" ? onEditLesson : onEditQuiz}
                  onDelete={
                    item.kind === "Lesson" ? onDeleteLesson : onDeleteQuiz
                  }
                  isEditing={
                    item.kind === "Lesson"
                      ? editingLessonId === item.id
                      : editingQuizId === item.id
                  }
                  editForm={item.kind === "Lesson" ? lessonForm : quizForm}
                  setEditForm={
                    item.kind === "Lesson" ? setLessonForm : setQuizForm
                  }
                  onUpdate={
                    item.kind === "Lesson" ? onUpdateLesson : onUpdateQuiz
                  }
                  onCancelEdit={() =>
                    item.kind === "Lesson"
                      ? setEditingLessonId(null)
                      : setEditingQuizId(null)
                  }
                />
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Chưa có nội dung</p>
              </div>
            )}

            {/* Add Content UI */}
            {addingItemToSection?.sectionId === section.id &&
              addingItemToSection.type === "choose" && (
                <ContentTypeSelector
                  onSelectLesson={() =>
                    onSelectContentType(section.id, "lesson")
                  }
                  onSelectQuiz={() => onSelectContentType(section.id, "quiz")}
                  onCancel={onCancelAddContent}
                />
              )}

            {/* Add Lesson Form */}
            {addingItemToSection?.sectionId === section.id &&
              addingItemToSection.type === "lesson" && (
                <LessonForm
                  lessonForm={lessonForm}
                  setLessonForm={setLessonForm}
                  onSave={() => onSaveLesson(section.id)}
                  onCancel={onCancelAddContent}
                  loading={loading}
                />
              )}

            {/* Add Quiz Form */}
            {addingItemToSection?.sectionId === section.id &&
              addingItemToSection.type === "quiz" && (
                <QuizForm
                  quizForm={quizForm}
                  setQuizForm={setQuizForm}
                  onSave={() => onSaveQuiz(section.id)}
                  onCancel={onCancelAddContent}
                  loading={loading}
                />
              )}
          </div>

          {/* Add Content Button */}
          {!addingItemToSection && (
            <button
              onClick={() => onAddContent(section.id)}
              className="w-full p-3 border-2 border-dashed rounded-lg hover:bg-[#FFD54F]/10 hover:border-[#FFD54F] transition-colors text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm nội dung
            </button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default SectionCard;
