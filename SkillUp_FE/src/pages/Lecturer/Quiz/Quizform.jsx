// src/pages/Lecturer/tabs/components/QuizForm.jsx
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function QuizForm({ quizForm, setQuizForm, onSave, onCancel, loading }) {
  return (
    <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
      <div className="space-y-2">
        <div>
          <input
            type="text"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            placeholder="Tên quiz"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            autoFocus
            maxLength="255"
          />
          <div className={`text-right text-sm ${quizForm.title.length === 255 ? 'text-red-500' : 'text-gray-500'}`}>
            {quizForm.title.length}/255
          </div>
        </div>
        <div>
          <textarea
            value={quizForm.description}
            onChange={(e) =>
              setQuizForm({ ...quizForm, description: e.target.value })
            }
            placeholder="Mô tả quiz"
            rows="2"
            className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
            maxLength="255"
          />
          <div className={`text-right text-sm ${quizForm.description.length === 255 ? 'text-red-500' : 'text-gray-500'}`}>
            {quizForm.description.length}/255
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Điểm đạt (%)</label>
            <input
              type="number"
              value={quizForm.passPercent}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? 0 : parseInt(e.target.value);
                setQuizForm({ ...quizForm, passPercent: value });
              }}
              min="0"
              max="100"
              step="1"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Thời gian (phút)</label>
            <input
              type="number"
              value={quizForm.timer}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? 0 : parseInt(e.target.value);
                setQuizForm({ ...quizForm, timer: value });
              }}
              min="1"
              step="1"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading || !quizForm.title.trim() || quizForm.title.length === 255 || quizForm.description.length === 255}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Check className="w-4 h-4 mr-1" />
            Tạo quiz
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4 mr-1" />
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizForm;