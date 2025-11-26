// src/pages/Lecturer/components/QuestionBankSelector.jsx
// DRAWER VERSION - Opens from LEFT with improved quick tools

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
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  Lightbulb,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Per-section selection counts
  const [sectionCounts, setSectionCounts] = useState({});

  // Quick selection preset
  const [quickSelectAmount, setQuickSelectAmount] = useState("5");

  // Drawer animation
  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
  }, []);

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
        if (Array.isArray(response.data.data)) {
          if (
            response.data.data.length > 0 &&
            Array.isArray(response.data.data[0])
          ) {
            sectionsData = response.data.data[0];
          } else {
            sectionsData = response.data.data;
          }
        }
      }

      if (sectionsData && sectionsData.length > 0) {
        setSections(sectionsData);
        // Auto-expand first section with questions
        const firstSectionWithQuestions = sectionsData.find(
          (s) => s.questionBanks && s.questionBanks.length > 0
        );
        if (firstSectionWithQuestions) {
          setExpandedSections({ [firstSectionWithQuestions.id]: true });
        }
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

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onCancel, 300);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleQuestion = (questionId) => {
    const newSelection = selectedQuestions.includes(questionId)
      ? selectedQuestions.filter((id) => id !== questionId)
      : [...selectedQuestions, questionId];

    setSelectedQuestions(newSelection);

    // Update per-section counts to reflect the new selection
    updateSectionCountsFromSelection(newSelection);
  };

  // Update section counts based on selected question IDs
  const updateSectionCountsFromSelection = (selectedIds) => {
    const newCounts = {};

    filteredSections.forEach((section) => {
      const countInSection = section.filteredQuestions.filter((q) =>
        selectedIds.includes(q.id)
      ).length;

      if (countInSection > 0) {
        newCounts[section.id] = countInSection;
      }
    });

    setSectionCounts(newCounts);
  };

  // Filter questions based on search term
  const filteredSections = sections
    .map((section) => {
      const filteredQuestions = (section.questionBanks || []).filter((q) => {
        if (!searchTerm) return true;
        const plainTitle = extractCleanText(q.title || "", 500);
        const plainDescription = extractCleanText(q.description || "", 500);
        const searchLower = searchTerm.toLowerCase();
        return (
          plainTitle.toLowerCase().includes(searchLower) ||
          plainDescription.toLowerCase().includes(searchLower)
        );
      });
      return { ...section, filteredQuestions };
    })
    .filter((section) => section.filteredQuestions.length > 0);

  const totalFilteredQuestions = filteredSections.reduce(
    (sum, section) => sum + section.filteredQuestions.length,
    0
  );

  // Select all filtered questions
  const handleSelectAll = () => {
    const allIds = filteredSections.flatMap((section) =>
      section.filteredQuestions.map((q) => q.id)
    );
    setSelectedQuestions(allIds);

    // Update per-section counts to reflect the selection
    updateSectionCountsFromSelection(allIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedQuestions([]);
    setSectionCounts({});
  };

  // Quick selection with preset amounts
  const handleQuickSelect = (amount) => {
    if (totalFilteredQuestions === 0) return;

    const count = parseInt(amount);
    const allIds = filteredSections.flatMap((section) =>
      section.filteredQuestions.map((q) => q.id)
    );
    const firstNIds = allIds.slice(0, Math.min(count, allIds.length));
    setSelectedQuestions(firstNIds);

    // Update per-section counts to reflect the selection
    updateSectionCountsFromSelection(firstNIds);
  };

  // Random selection with preset amounts
  const handleRandomSelect = (amount) => {
    if (totalFilteredQuestions === 0) return;

    const count = parseInt(amount);
    const allIds = filteredSections.flatMap((section) =>
      section.filteredQuestions.map((q) => q.id)
    );
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    const randomIds = shuffled.slice(0, Math.min(count, allIds.length));
    setSelectedQuestions(randomIds);

    // Update per-section counts to reflect the selection
    updateSectionCountsFromSelection(randomIds);
  };

  // Apply per-section counts
  const handleApplySectionCounts = () => {
    const newSelection = [];

    Object.keys(sectionCounts).forEach((sectionId) => {
      const count = sectionCounts[sectionId];
      if (count > 0) {
        const section = filteredSections.find((s) => s.id === sectionId);
        if (section) {
          const questionIds = section.filteredQuestions
            .slice(0, count)
            .map((q) => q.id);
          newSelection.push(...questionIds);
        }
      }
    });

    setSelectedQuestions(newSelection);
  };

  // Update section count
  const updateSectionCount = (sectionId, value) => {
    const section = filteredSections.find((s) => s.id === sectionId);
    const maxCount = section ? section.filteredQuestions.length : 0;
    const count = Math.max(0, Math.min(parseInt(value) || 0, maxCount));

    setSectionCounts((prev) => ({
      ...prev,
      [sectionId]: count,
    }));
  };

  // Expand all sections
  const handleExpandAll = () => {
    const allExpanded = {};
    filteredSections.forEach((section) => {
      allExpanded[section.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  // Collapse all sections
  const handleCollapseAll = () => {
    setExpandedSections({});
  };

  const handleAddSelected = () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    onAddFromBank(selectedQuestions);
  };

  // Count selected questions per section
  const getSelectedCountInSection = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return 0;
    return (section.questionBanks || []).filter((q) =>
      selectedQuestions.includes(q.id)
    ).length;
  };

  // Loading State
  if (loadingData) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
        <div
          className={`fixed right-0 top-0 h-full w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600 font-medium">
              Đang tải danh sách chương...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error State
  if (error) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
        <div
          className={`fixed right-0 top-0 h-full w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-lg w-full bg-white rounded-2xl border-2 border-red-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Không thể tải câu hỏi
                  </h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={loadSections}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Thử lại
                </Button>
                <Button
                  onClick={onSwitchToManual}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mới
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Drawer Content */}
      <div
        className={`fixed right-0 top-0 h-full w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          {/* Title Bar - Smaller */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>
              <Button
                onClick={onSwitchToManual}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tạo mới
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ngân hàng câu hỏi</h1>
                <p className="text-sm text-blue-100">
                  {sections.length} chương •{" "}
                  {sections.reduce(
                    (sum, s) => sum + (s.questionBanks?.length || 0),
                    0
                  )}{" "}
                  câu hỏi
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Compact */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 text-base transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-5 space-y-5">
            {/* Helper Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Sử dụng công cụ chọn nhanh bên dưới hoặc chọn thủ công từng
                  câu hỏi từ các chương.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Công cụ chọn nhanh
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Section 1: Basic Selection */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Chọn cơ bản
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleSelectAll}
                      size="sm"
                      variant="outline"
                      className="justify-center border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                      disabled={totalFilteredQuestions === 0}
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Tất cả ({totalFilteredQuestions})
                    </Button>
                    <Button
                      onClick={handleDeselectAll}
                      size="sm"
                      variant="outline"
                      className="justify-center"
                      disabled={selectedQuestions.length === 0}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Bỏ chọn
                    </Button>
                  </div>
                </div>

                {/* Section 2: Quick Preset Selection */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Chọn nhanh theo số lượng
                  </p>

                  {/* Preset buttons */}
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {["5", "10", "15", "20", "25"].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setQuickSelectAmount(amount)}
                        size="sm"
                        variant="outline"
                        className={`text-sm ${
                          quickSelectAmount === amount
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-blue-300 hover:bg-blue-50"
                        }`}
                        disabled={totalFilteredQuestions < parseInt(amount)}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>

                  {/* Number input with validation */}
                  <div className="mb-2">
                    <input
                      type="number"
                      min="1"
                      max={totalFilteredQuestions}
                      value={quickSelectAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        const num = parseInt(value) || 0;
                        const validated = Math.max(
                          1,
                          Math.min(num, totalFilteredQuestions)
                        );
                        setQuickSelectAmount(
                          value === "" ? "" : validated.toString()
                        );
                      }}
                      onBlur={() => {
                        if (
                          quickSelectAmount === "" ||
                          parseInt(quickSelectAmount) < 1
                        ) {
                          setQuickSelectAmount("5");
                        }
                      }}
                      placeholder="Nhập số câu..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base text-center"
                      disabled={totalFilteredQuestions === 0}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleQuickSelect(quickSelectAmount)}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 bg-blue-50 text-blue-700"
                      disabled={
                        totalFilteredQuestions === 0 || !quickSelectAmount
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Chọn đầu
                    </Button>
                    <Button
                      onClick={() => handleRandomSelect(quickSelectAmount)}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 bg-purple-50 text-purple-700"
                      disabled={
                        totalFilteredQuestions === 0 || !quickSelectAmount
                      }
                    >
                      <Shuffle className="w-4 h-4 mr-1" />
                      Ngẫu nhiên
                    </Button>
                  </div>
                </div>

                {/* Section 3: Per-Section Selection */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-600">
                      Chọn theo từng chương
                    </p>
                    <Button
                      onClick={handleApplySectionCounts}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-sm"
                      disabled={Object.keys(sectionCounts).every(
                        (k) => !sectionCounts[k] || sectionCounts[k] === 0
                      )}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Áp dụng
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredSections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {section.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {section.filteredQuestions.length} câu
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={section.filteredQuestions.length}
                            value={sectionCounts[section.id] || 0}
                            onChange={(e) =>
                              updateSectionCount(section.id, e.target.value)
                            }
                            className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">câu</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: View Controls */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleExpandAll}
                      size="sm"
                      variant="ghost"
                      className="text-sm"
                    >
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Mở rộng
                    </Button>
                    <Button
                      onClick={handleCollapseAll}
                      size="sm"
                      variant="ghost"
                      className="text-sm"
                    >
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Thu gọn
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections List */}
            {filteredSections.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">
                  {searchTerm
                    ? "Không tìm thấy câu hỏi phù hợp"
                    : "Không có chương nào có câu hỏi"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSections.map((section) => {
                  const isExpanded = expandedSections[section.id];
                  const selectedInSection = getSelectedCountInSection(
                    section.id
                  );
                  const totalInSection = section.filteredQuestions.length;

                  return (
                    <div
                      key={section.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base text-gray-900 truncate">
                              {section.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {totalInSection} câu hỏi
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedInSection > 0 && (
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                              {selectedInSection}/{totalInSection}
                            </span>
                          )}
                          <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium">
                            #{section.orders}
                          </span>
                        </div>
                      </button>

                      {/* Questions List */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                          {section.filteredQuestions.map((question, index) => {
                            const cleanTitle =
                              extractCleanText(question.title, 200) ||
                              "Không có tiêu đề";
                            const isSelected = selectedQuestions.includes(
                              question.id
                            );

                            return (
                              <div
                                key={question.id}
                                onClick={() => toggleQuestion(question.id)}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  isSelected
                                    ? "bg-blue-100 border-blue-400"
                                    : "bg-white border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        isSelected
                                          ? "bg-blue-600 border-blue-600"
                                          : "border-gray-300 bg-white"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-bold text-gray-500">
                                        #{index + 1}
                                      </span>
                                      <p className="text-base font-medium text-gray-900 flex-1">
                                        {cleanTitle}
                                      </p>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                      <span className="text-sm px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {question.type === "SingleChoice"
                                          ? "Một đáp án"
                                          : "Nhiều đáp án"}
                                      </span>
                                      {question.answers?.length > 0 && (
                                        <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                          {question.answers.length} đáp án
                                        </span>
                                      )}
                                      {question.image && (
                                        <span className="text-sm px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                          📷
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              {selectedQuestions.length > 0
                ? `Đã chọn ${selectedQuestions.length} câu hỏi`
                : "Chưa chọn câu hỏi nào"}
            </div>
            <Button
              onClick={handleAddSelected}
              disabled={loading || selectedQuestions.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Thêm câu hỏi
              {selectedQuestions.length > 0 && ` (${selectedQuestions.length})`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuestionBankSelector;
