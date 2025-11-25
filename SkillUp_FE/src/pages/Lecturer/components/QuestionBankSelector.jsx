// src/pages/Lecturer/components/QuestionBankSelector.jsx
import { useState, useEffect } from "react";
import {
  Check,
  X,
  Search,
  Plus,
  AlertCircle,
  Shuffle,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { extractCleanText } from "@/utils/htmlUtils";
import axiosInstance from "@/lib/axios";

function QuestionBankSelector({
  courseId,
  sectionId,
  onAddFromBank,
  onSwitchToManual,
  onCancel,
  loading,
}) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [randomCount, setRandomCount] = useState(5);

  useEffect(() => {
    loadSections();
  }, [courseId]);

  const loadSections = async () => {
    try {
      setLoadingData(true);
      setError(null);

      if (!courseId) {
        setError("Missing courseId");
        setSections([]);
        setLoadingData(false);
        return;
      }

      const response = await axiosInstance.get(
        `http://localhost:5120/api/QuestionBank/getByCourseId/${courseId}`
      );

      let sectionsData = [];

      if (response.data?.data) {
        // Handle nested array structure [[sections...]]
        if (Array.isArray(response.data.data)) {
          if (response.data.data.length > 0 && Array.isArray(response.data.data[0])) {
            sectionsData = response.data.data[0];
          } else {
            sectionsData = response.data.data;
          }
        }
      }

      if (sectionsData && sectionsData.length > 0) {
        setSections(sectionsData);
      } else {
        setSections([]);
        setError("Không có chương nào có ngân hàng câu hỏi");
      }
    } catch (error) {
      console.error("Error loading sections:", error);
      setError(error.message || "Không thể tải danh sách chương");
      setSections([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setBankQuestions(section.questionBanks || []);
    setSelectedQuestions([]);
    setSearchTerm("");
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setBankQuestions([]);
    setSelectedQuestions([]);
    setSearchTerm("");
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Select all filtered questions
  const handleSelectAll = () => {
    const allIds = filteredQuestions.map((q) => q.id);
    setSelectedQuestions(allIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  };

  // Random selection
  const handleRandomSelect = () => {
    if (filteredQuestions.length === 0) {
      return;
    }

    const count = Math.min(randomCount, filteredQuestions.length);
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const randomIds = shuffled.slice(0, count).map((q) => q.id);

    setSelectedQuestions(randomIds);
  };

  // Select first N questions
  const handleSelectCount = () => {
    if (filteredQuestions.length === 0) {
      return;
    }

    const count = Math.min(randomCount, filteredQuestions.length);
    const firstNIds = filteredQuestions.slice(0, count).map((q) => q.id);

    setSelectedQuestions(firstNIds);
  };

  const handleAddSelected = () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    onAddFromBank(selectedQuestions);
  };

  // Filter questions with HTML-aware search
  const filteredQuestions = bankQuestions.filter((q) => {
    const plainTitle = extractCleanText(q.title || "", 500);
    const plainDescription = extractCleanText(q.description || "", 500);
    const searchLower = searchTerm.toLowerCase();

    return (
      plainTitle.toLowerCase().includes(searchLower) ||
      plainDescription.toLowerCase().includes(searchLower)
    );
  });

  // Loading State
  if (loadingData) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">
            Đang tải danh sách chương...
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
              onClick={loadSections}
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
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // LAYER 1: Section Selection
  if (!selectedSection) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Chọn chương
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Bước 1/2: Chọn chương để xem ngân hàng câu hỏi
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

          {/* Section List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Không có chương nào</p>
              </div>
            ) : (
              sections.map((section) => {
                const questionCount = section.questionBanks?.length || 0;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(section)}
                    disabled={questionCount === 0}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      questionCount === 0
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                        : "border-blue-200 bg-white hover:border-blue-400 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {section.title}
                        </h4>
                        {section.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {section.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {questionCount} câu hỏi
                          </span>
                          {section.orders && (
                            <span className="text-xs text-gray-500">
                              Thứ tự: {section.orders}
                            </span>
                          )}
                        </div>
                      </div>
                      {questionCount > 0 && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
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

  // LAYER 2: Question Selection
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBackToSections}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedSection.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Bước 2/2: Chọn câu hỏi từ ngân hàng ({bankQuestions.length} câu hỏi)
              </p>
            </div>
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

        {/* Quick Selection Tools */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200">
            <h4 className="text-sm font-semibold text-gray-800">
              Công cụ chọn nhanh
            </h4>
            {selectedQuestions.length > 0 && (
              <span className="text-sm px-3 py-1 bg-blue-600 text-white rounded-full font-medium shadow-sm">
                {selectedQuestions.length} đã chọn
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column: Select/Deselect All */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2 min-h-[32px] flex items-center">
                Chọn hàng loạt
              </p>
              <Button
                onClick={handleSelectAll}
                size="sm"
                variant="outline"
                className="w-full justify-start border-green-300 bg-green-50 text-green-700 hover:bg-green-100 h-10"
                disabled={filteredQuestions.length === 0}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Chọn tất cả ({filteredQuestions.length})
              </Button>
              <Button
                onClick={handleDeselectAll}
                size="sm"
                variant="outline"
                className="w-full justify-start border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-10"
                disabled={selectedQuestions.length === 0}
              >
                <Square className="w-4 h-4 mr-2" />
                Bỏ chọn tất cả
              </Button>
            </div>

            {/* Right Column: Smart Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">
                  Chọn thông minh
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={filteredQuestions.length}
                    value={randomCount}
                    onChange={(e) =>
                      setRandomCount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={filteredQuestions.length === 0}
                  />
                  <span className="text-xs text-gray-600 font-medium">câu</span>
                </div>
              </div>
              <Button
                onClick={handleRandomSelect}
                size="sm"
                variant="outline"
                className="w-full justify-start border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 h-10"
                disabled={filteredQuestions.length === 0}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Chọn ngẫu nhiên
              </Button>
              <Button
                onClick={handleSelectCount}
                size="sm"
                variant="outline"
                className="w-full justify-start border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 h-10"
                disabled={filteredQuestions.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Chọn đầu tiên
              </Button>
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="max-h-96 overflow-y-auto space-y-2 bg-white rounded-lg p-2">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Không tìm thấy câu hỏi phù hợp</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => {
              const cleanTitle =
                extractCleanText(question.title, 200) || "Không có tiêu đề";
              const cleanDescription = question.description
                ? extractCleanText(question.description, 100)
                : null;

              return (
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

                    {/* Question Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm leading-snug">
                            {cleanTitle}
                          </p>

                          {cleanDescription && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {cleanDescription}
                            </p>
                          )}

                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {question.type === "SingleChoice"
                                ? "Một đáp án"
                                : "Nhiều đáp án"}
                            </span>
                            {question.answers && question.answers.length > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {question.answers.length} đáp án
                              </span>
                            )}
                            {question.image && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded">
                                Có ảnh
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleAddSelected}
            disabled={loading || selectedQuestions.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            Thêm{" "}
            {selectedQuestions.length > 0 && `${selectedQuestions.length} `}câu
            hỏi
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