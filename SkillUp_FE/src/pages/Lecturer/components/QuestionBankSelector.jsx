// src/pages/Lecturer/components/QuestionBankSelector.jsx
import { useState, useEffect } from "react";
import { Check, X, Search, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuestionsBySection } from "@/api/questionBankAPI";
import { toast } from "react-toastify";

function QuestionBankSelector({ 
  courseId, 
  sectionId, 
  onAddFromBank, 
  onSwitchToManual, 
  onCancel, 
  loading 
}) {
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBankQuestions();
  }, [sectionId, courseId]);

  const loadBankQuestions = async () => {
    try {
      setLoadingBank(true);
      setError(null);
      
      
      if (!courseId || !sectionId) {
        setError("Missing courseId or sectionId");
        setBankQuestions([]);
        setLoadingBank(false);
        return;
      }
      
      const data = await getQuestionsBySection(sectionId, courseId);
      
      if (data && Array.isArray(data)) {
        setBankQuestions(data);
        
        if (data.length === 0) {
          setError("Không có câu hỏi nào trong ngân hàng cho chương này");
        }
      } else {
        setBankQuestions([]);
        setError("Dữ liệu không hợp lệ từ API");
      }
    } catch (error) {
      setError(error.message || "Không thể tải câu hỏi");
      setBankQuestions([]);
    } finally {
      setLoadingBank(false);
    }
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleAddSelected = () => {
    if (selectedQuestions.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 câu hỏi");
      return;
    }
    console.log("➕ Adding selected questions:", selectedQuestions);
    onAddFromBank(selectedQuestions);
  };

  const filteredQuestions = bankQuestions.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading State
  if (loadingBank) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Đang tải ngân hàng câu hỏi...</p>
          <p className="text-xs text-gray-500 mt-1">
            Course: {courseId?.substring(0, 8)}... | Section: {sectionId?.substring(0, 8)}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border-2 border-yellow-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-yellow-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={loadBankQuestions}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Thử lại
            </Button>
            <Button
              onClick={onSwitchToManual}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Tạo câu hỏi mới
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm" className="text-xs">
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Questions List - Table-like display
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Chọn từ ngân hàng câu hỏi
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {bankQuestions.length} câu hỏi có sẵn
            </p>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Question List - Table Style */}
        <div className="max-h-96 overflow-y-auto space-y-2 bg-white rounded-lg p-2">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Không tìm thấy câu hỏi phù hợp</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                onClick={() => toggleQuestion(question.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedQuestions.includes(question.id)
                    ? "bg-blue-100 border-blue-400 shadow-sm"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedQuestions.includes(question.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Question Info - Table-like */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm leading-snug">
                          {question.title || "Không có tiêu đề"}
                        </p>
                        {question.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {question.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {question.answers && question.answers.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {question.answers.length} đáp án
                            </span>
                          )}
                          {question.createdAt && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selection Summary */}
        {selectedQuestions.length > 0 && (
          <div className="p-2 bg-blue-100 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Đã chọn: {selectedQuestions.length} câu hỏi
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleAddSelected}
            disabled={loading || selectedQuestions.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            Thêm {selectedQuestions.length > 0 && `${selectedQuestions.length} `}câu hỏi
          </Button>
          <Button
            onClick={onSwitchToManual}
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Tạo mới
          </Button>
          <Button onClick={onCancel} variant="outline">
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionBankSelector;