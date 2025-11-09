// src/pages/Lecturer/tabs/components/ContentTypeSelector.jsx
import { FileText, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function ContentTypeSelector({ onSelectLesson, onSelectQuiz, onCancel }) {
  return (
    <div className="p-4 bg-[#FFD54F]/10 border-2 border-[#FFD54F]/30 rounded-lg">
      <p className="text-sm font-medium mb-3 text-gray-900">
        Chọn loại nội dung:
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSelectLesson}
          className="p-4 border-2 border-[#FFD54F]/50 rounded-lg hover:bg-[#FFD54F]/20 hover:border-[#FFD54F] text-left transition-colors"
        >
          <FileText className="w-6 h-6 text-[#FFA726] mb-2" />
          <h4 className="font-semibold text-sm text-gray-900">Bài học</h4>
          <p className="text-xs text-gray-600">Video hoặc văn bản</p>
        </button>
        <button
          onClick={onSelectQuiz}
          className="p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 text-left transition-colors"
        >
          <HelpCircle className="w-6 h-6 text-orange-600 mb-2" />
          <h4 className="font-semibold text-sm text-gray-900">Quiz</h4>
          <p className="text-xs text-gray-600">Bài kiểm tra</p>
        </button>
      </div>
      <Button
        onClick={onCancel}
        variant="outline"
        size="sm"
        className="mt-3 w-full"
      >
        <X className="w-4 h-4 mr-1" />
        Hủy
      </Button>
    </div>
  );
}

export default ContentTypeSelector;