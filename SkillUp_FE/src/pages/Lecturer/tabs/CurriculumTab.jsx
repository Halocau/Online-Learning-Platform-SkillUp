import { useState, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  X,
  Check,
  Upload,
  FileDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { createSection, updateSection, deleteSection } from "@/api/sectionAPI";
import { createLesson, updateLesson, deleteLesson } from "@/api/lessonAPI";
import { createQuiz, updateQuiz, deleteQuiz } from "@/api/quizAPI";

function CurriculumTab({ course, courseId, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [localCourse, setLocalCourse] = useState(course);

  // Update local course when prop changes
  useEffect(() => {
    setLocalCourse(course);
  }, [course]);

  // Use localCourse for display
  const displayCourse = localCourse || course;

  // Form states
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [addingItemToSection, setAddingItemToSection] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Form data
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    type: "Video",
    isFree: false,
    lessonOrder: 0,
    content: "",
    videoFile: null,
    pdfFile: null,
  });
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    passPercent: 70,
    timer: 15,
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Helper function to add quiz optimistically to local state
  const addQuizToLocalState = (sectionId, quizData) => {
    setLocalCourse((prevCourse) => {
      if (!prevCourse) return prevCourse;

      const newCourse = { ...prevCourse };
      newCourse.sections = newCourse.sections.map((section) => {
        if (section.id === sectionId) {
          const quizOrder = quizData.orders || 1;

          console.log(`Adding quiz to section with order: ${quizOrder}`);

          const newQuiz = {
            kind: "Quiz",
            id: `temp-${Date.now()}`,
            orders: quizOrder,
            title: quizData.title,
            description: quizData.description,
            passPercent: quizData.passPercent,
            timer: quizData.timer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...section,
            items: [...(section.items || []), newQuiz],
          };
        }
        return section;
      });

      return newCourse;
    });
  };

  // Section handlers
  const handleAddSectionClick = () => {
    setShowAddSection(true);
    setSectionForm({ title: "", description: "" });
  };

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) {
      toast.error("Vui lòng nhập tên chương");
      return;
    }

    setLoading(true);
    const result = await createSection({
      courseId: courseId,
      title: sectionForm.title,
      description: sectionForm.description,
    });

    if (result) {
      setShowAddSection(false);
      setSectionForm({ title: "", description: "" });
      await onUpdate();
    }
    setLoading(false);
  };

  const handleEditSectionClick = (section) => {
    setEditingSectionId(section.id);
    setSectionForm({
      title: section.title,
      description: section.description || "",
    });
  };

  const handleUpdateSection = async (sectionId) => {
    if (!sectionForm.title.trim()) {
      toast.error("Vui lòng nhập tên chương");
      return;
    }

    setLoading(true);
    const result = await updateSection(sectionId, {
      title: sectionForm.title,
      description: sectionForm.description,
    });

    if (result) {
      setEditingSectionId(null);
      setSectionForm({ title: "", description: "" });
      await onUpdate();
    }
    setLoading(false);
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm("Xóa chương này?")) {
      setLoading(true);
      await deleteSection(sectionId);
      await onUpdate();
      setLoading(false);
    }
  };

  // Content type selection
  const handleAddContentClick = (sectionId) => {
    setAddingItemToSection({ sectionId, type: "choose" });
  };

  const handleSelectContentType = (sectionId, type) => {
    setAddingItemToSection({ sectionId, type });
    if (type === "lesson") {
      setLessonForm({
        title: "",
        description: "",
        type: "Video",
        isFree: false,
        lessonOrder: 0,
        content: "",
        videoFile: null,
        pdfFile: null,
      });
    } else if (type === "quiz") {
      setQuizForm({
        title: "",
        description: "",
        passPercent: 70,
        timer: 15,
      });
    }
  };

  // Lesson handlers
  const handleSaveLesson = async (sectionId) => {
    if (!lessonForm.title.trim()) {
      toast.error("Vui lòng nhập tên bài học");
      return;
    }

    if (lessonForm.type === "Video" && !lessonForm.videoFile) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    if (lessonForm.type === "Text" && !lessonForm.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài học");
      return;
    }

    setLoading(true);

    try {
      const section = displayCourse?.sections?.find((s) => s.id === sectionId);
      const maxOrder = section?.items?.length
        ? Math.max(...section.items.map((item) => item.orders || 0))
        : 0;

      const result = await createLesson({
        sectionId: sectionId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        type: lessonForm.type,
        isFree: lessonForm.isFree,
        lessonOrder: maxOrder + 1,
        content: lessonForm.type === "Text" ? lessonForm.content.trim() : "",
        videoFile: lessonForm.type === "Video" ? lessonForm.videoFile : null,
        fileUrl: lessonForm.pdfFile || null,
      });

      if (result) {
        setAddingItemToSection(null);
        await onUpdate();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLessonClick = (lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      type: lesson.lessonType,
      isFree: lesson.isFree,
      lessonOrder: lesson.orders,
      content: lesson.assets?.[0]?.content || "",
      videoFile: null,
      pdfFile: null,
    });
  };

  const handleUpdateLesson = async (lessonId) => {
    if (!lessonForm.title.trim()) {
      toast.error("Vui lòng nhập tên bài học");
      return;
    }

    setLoading(true);
    const result = await updateLesson(lessonId, {
      title: lessonForm.title,
      description: lessonForm.description,
      isFree: lessonForm.isFree,
      lessonOrder: lessonForm.lessonOrder,
      content: lessonForm.content,
      videoFile: lessonForm.videoFile,
      fileUrl: lessonForm.pdfFile,
    });

    if (result) {
      setEditingLessonId(null);
      await onUpdate();
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Xóa bài học này?")) {
      setLoading(true);
      try {
        await deleteLesson(lessonId);
        await onUpdate();
      } catch (error) {
        console.error("Delete lesson error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Quiz handlers
  // Quiz handlers - PASS ORDERS TO BACKEND
  const handleSaveQuiz = async (sectionId) => {
    if (!quizForm.title || quizForm.title.trim() === "") {
      toast.error("Vui lòng nhập tên quiz");
      return;
    }

    const passPercent = parseInt(quizForm.passPercent);
    const timer = parseInt(quizForm.timer);

    if (isNaN(passPercent) || passPercent < 0 || passPercent > 100) {
      toast.error("Điểm đạt phải từ 0 đến 100");
      return;
    }

    if (isNaN(timer) || timer <= 0) {
      toast.error("Thời gian phải lớn hơn 0");
      return;
    }

    setLoading(true);

    try {
      console.log("=== Starting Quiz Creation ===");

      // Calculate the next order number
      const section = displayCourse?.sections?.find((s) => s.id === sectionId);
      let nextOrder = 1;

      if (section?.items && section.items.length > 0) {
        const maxOrder = Math.max(
          ...section.items.map((item) => item.orders || 0)
        );
        nextOrder = maxOrder + 1;
      }

      console.log("Section items count:", section?.items?.length || 0);
      console.log("Calculated next order:", nextOrder);

      const quizData = {
        sectionId: sectionId,
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passPercent: passPercent,
        timer: timer,
        orders: nextOrder, // INCLUDE ORDERS IN API CALL
      };

      console.log("Quiz data WITH orders:", quizData);

      const result = await createQuiz(quizData);

      if (result !== null && result !== undefined) {
        console.log("✅ Quiz created successfully!");

        // Add to local state
        const optimisticQuiz = {
          ...quizData,
          orders: nextOrder,
        };

        console.log("Adding quiz to local state with order:", nextOrder);
        addQuizToLocalState(sectionId, optimisticQuiz);

        setAddingItemToSection(null);
        setQuizForm({
          title: "",
          description: "",
          passPercent: 70,
          timer: 15,
        });

        toast.success(`✅ Quiz đã được tạo (Thứ tự: ${nextOrder})`, {
          autoClose: 3000,
        });

        console.log("⚠️ NOT refreshing from backend due to known bug");
      } else {
        toast.error("Không thể tạo quiz - vui lòng thử lại");
      }
    } catch (error) {
      console.error("=== Quiz Creation Failed ===");
      console.error("Error:", error);
      toast.error("Lỗi khi tạo quiz: " + (error.message || "Vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuizClick = (quiz) => {
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || "",
      passPercent: quiz.passPercent,
      timer: quiz.timer,
    });
  };

  const handleUpdateQuiz = async (quizId) => {
    if (!quizForm.title || quizForm.title.trim() === "") {
      toast.error("Vui lòng nhập tên quiz");
      return;
    }

    const passPercent = parseInt(quizForm.passPercent);
    const timer = parseInt(quizForm.timer);

    if (isNaN(passPercent) || passPercent < 0 || passPercent > 100) {
      toast.error("Điểm đạt phải từ 0 đến 100");
      return;
    }

    if (isNaN(timer) || timer <= 0) {
      toast.error("Thời gian phải lớn hơn 0");
      return;
    }

    setLoading(true);

    try {
      const result = await updateQuiz(quizId, {
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passPercent: passPercent,
        timer: timer,
      });

      if (result !== null) {
        setEditingQuizId(null);

        // Update local state
        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) => ({
            ...section,
            items: section.items?.map((item) =>
              item.id === quizId
                ? {
                    ...item,
                    title: quizForm.title,
                    description: quizForm.description,
                    passPercent,
                    timer,
                  }
                : item
            ),
          }));
          return newCourse;
        });

        toast.success("Quiz đã được cập nhật!");
      }
    } catch (error) {
      console.error("Quiz update error:", error);
      toast.error("Lỗi khi cập nhật quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Xóa quiz này?")) {
      setLoading(true);
      try {
        await deleteQuiz(quizId);

        // Remove from local state
        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) => ({
            ...section,
            items: section.items?.filter((item) => item.id !== quizId),
          }));
          return newCourse;
        });

        toast.success("Quiz đã được xóa!");
      } catch (error) {
        console.error("Delete quiz error:", error);
        toast.error("Lỗi khi xóa quiz");
      } finally {
        setLoading(false);
      }
    }
  };

  const getLessonIcon = (lesson) => {
    if (lesson.lessonType === "Video") {
      return <Video className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto">
      

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Nội dung khóa học
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {displayCourse?.sections?.length || 0} chương
          </p>
        </div>
        <Button
          onClick={handleAddSectionClick}
          disabled={loading || showAddSection}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Chương mới
        </Button>
      </div>

      {/* Add Section Form */}
      {showAddSection && (
        <Card className="mb-4 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên chương (VD: Chương 1: Giới thiệu)"
                value={sectionForm.title}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <textarea
                placeholder="Mô tả chương (không bắt buộc)"
                value={sectionForm.description}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    description: e.target.value,
                  })
                }
                rows="2"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSection}
                  disabled={loading || !sectionForm.title.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Lưu
                </Button>
                <Button
                  onClick={() => {
                    setShowAddSection(false);
                    setSectionForm({ title: "", description: "" });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hủy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {displayCourse?.sections && displayCourse.sections.length > 0 ? (
          displayCourse.sections.map((section, index) => (
            <Card key={section.id} className="overflow-hidden">
              {/* Section Header */}
              {editingSectionId === section.id ? (
                <div className="p-4 bg-yellow-50 border-b">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={sectionForm.title}
                      onChange={(e) =>
                        setSectionForm({
                          ...sectionForm,
                          title: e.target.value,
                        })
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
                        onClick={() => handleUpdateSection(section.id)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Lưu
                      </Button>
                      <Button
                        onClick={() => setEditingSectionId(null)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                    {index + 1}
                  </span>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.items?.length || 0} mục
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSectionClick(section);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              )}

              {/* Section Content */}
              {expandedSections[section.id] && (
                <CardContent className="p-4 pt-0">
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3 p-3 bg-blue-50 rounded">
                      {section.description}
                    </p>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 mb-3">
                    {section.items && section.items.length > 0 ? (
                      section.items.map((item) => (
                        <div key={item.id}>
                          {/* Edit Lesson Form */}
                          {item.kind === "Lesson" &&
                          editingLessonId === item.id ? (
                            <div className="p-3 bg-yellow-50 border rounded">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={lessonForm.title}
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Tên bài học"
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <textarea
                                  value={lessonForm.description}
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Mô tả"
                                  rows="2"
                                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                                />
                                <div className="flex gap-3">
                                  <select
                                    value={lessonForm.type}
                                    onChange={(e) =>
                                      setLessonForm({
                                        ...lessonForm,
                                        type: e.target.value,
                                      })
                                    }
                                    className="px-3 py-2 border rounded-lg text-sm"
                                  >
                                    <option value="Video">Video</option>
                                    <option value="Text">Văn bản</option>
                                  </select>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={lessonForm.isFree}
                                      onChange={(e) =>
                                        setLessonForm({
                                          ...lessonForm,
                                          isFree: e.target.checked,
                                        })
                                      }
                                    />
                                    <span className="text-sm">Miễn phí</span>
                                  </label>
                                </div>
                                {lessonForm.type === "Text" && (
                                  <textarea
                                    value={lessonForm.content}
                                    onChange={(e) =>
                                      setLessonForm({
                                        ...lessonForm,
                                        content: e.target.value,
                                      })
                                    }
                                    placeholder="Nội dung bài học..."
                                    rows="4"
                                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                                  />
                                )}
                                {lessonForm.type === "Video" && (
                                  <div>
                                    <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                      <Upload className="w-4 h-4" />
                                      <span className="text-sm">
                                        {lessonForm.videoFile
                                          ? lessonForm.videoFile.name
                                          : "Chọn video mới"}
                                      </span>
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                          setLessonForm({
                                            ...lessonForm,
                                            videoFile: e.target.files[0],
                                          })
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                )}
                                <div>
                                  <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                    <FileDown className="w-4 h-4" />
                                    <span className="text-sm">
                                      {lessonForm.pdfFile
                                        ? lessonForm.pdfFile.name
                                        : "Tài liệu PDF (không bắt buộc)"}
                                    </span>
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) =>
                                        setLessonForm({
                                          ...lessonForm,
                                          pdfFile: e.target.files[0],
                                        })
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateLesson(item.id)}
                                    size="sm"
                                    className="bg-purple-600"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Lưu
                                  </Button>
                                  <Button
                                    onClick={() => setEditingLessonId(null)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : item.kind === "Quiz" &&
                            editingQuizId === item.id ? (
                            /* Edit Quiz Form */
                            <div className="p-3 bg-yellow-50 border rounded">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={quizForm.title}
                                  onChange={(e) =>
                                    setQuizForm({
                                      ...quizForm,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Tên quiz"
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <textarea
                                  value={quizForm.description}
                                  onChange={(e) =>
                                    setQuizForm({
                                      ...quizForm,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Mô tả"
                                  rows="2"
                                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-600">
                                      Điểm đạt (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={quizForm.passPercent}
                                      onChange={(e) => {
                                        const value =
                                          e.target.value === ""
                                            ? 0
                                            : parseInt(e.target.value);
                                        setQuizForm({
                                          ...quizForm,
                                          passPercent: value,
                                        });
                                      }}
                                      min="0"
                                      max="100"
                                      step="1"
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-600">
                                      Thời gian (phút)
                                    </label>
                                    <input
                                      type="number"
                                      value={quizForm.timer}
                                      onChange={(e) => {
                                        const value =
                                          e.target.value === ""
                                            ? 0
                                            : parseInt(e.target.value);
                                        setQuizForm({
                                          ...quizForm,
                                          timer: value,
                                        });
                                      }}
                                      min="1"
                                      step="1"
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateQuiz(item.id)}
                                    size="sm"
                                    className="bg-orange-600"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Lưu
                                  </Button>
                                  <Button
                                    onClick={() => setEditingQuizId(null)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Display Item */
                            <div className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow-sm">
                              {item.kind === "Lesson" && getLessonIcon(item)}
                              {item.kind === "Quiz" && (
                                <HelpCircle className="w-4 h-4 text-orange-500" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded font-semibold text-xs">
                                    {item.orders}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.kind === "Lesson"
                                      ? "Bài học"
                                      : "Quiz"}
                                  </span>
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {item.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.kind === "Lesson" && (
                                    <>
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                        {item.lessonType}
                                      </span>
                                      {item.isFree && (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                          Miễn phí
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {item.kind === "Quiz" && (
                                    <span className="text-xs text-gray-500">
                                      Pass: {item.passPercent}% • {item.timer}{" "}
                                      phút
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    item.kind === "Lesson"
                                      ? handleEditLessonClick(item)
                                      : handleEditQuizClick(item)
                                  }
                                  className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    item.kind === "Lesson"
                                      ? handleDeleteLesson(item.id)
                                      : handleDeleteQuiz(item.id)
                                  }
                                  className="p-2 hover:bg-red-100 rounded text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có nội dung</p>
                      </div>
                    )}

                    {/* Add Content Choice */}
                    {addingItemToSection?.sectionId === section.id &&
                      addingItemToSection.type === "choose" && (
                        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded">
                          <p className="text-sm font-medium mb-3">
                            Chọn loại nội dung:
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                handleSelectContentType(section.id, "lesson")
                              }
                              className="p-4 border-2 border-purple-300 rounded-lg hover:bg-purple-100 text-left transition-colors"
                            >
                              <FileText className="w-6 h-6 text-purple-600 mb-2" />
                              <h4 className="font-semibold text-sm">Bài học</h4>
                              <p className="text-xs text-gray-600">
                                Video hoặc văn bản
                              </p>
                            </button>
                            <button
                              onClick={() =>
                                handleSelectContentType(section.id, "quiz")
                              }
                              className="p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-100 text-left transition-colors"
                            >
                              <HelpCircle className="w-6 h-6 text-orange-600 mb-2" />
                              <h4 className="font-semibold text-sm">Quiz</h4>
                              <p className="text-xs text-gray-600">
                                Bài kiểm tra
                              </p>
                            </button>
                          </div>
                          <Button
                            onClick={() => setAddingItemToSection(null)}
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Hủy
                          </Button>
                        </div>
                      )}

                    {/* Add Lesson Form */}
                    {addingItemToSection?.sectionId === section.id &&
                      addingItemToSection.type === "lesson" && (
                        <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={lessonForm.title}
                              onChange={(e) =>
                                setLessonForm({
                                  ...lessonForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Tên bài học"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              autoFocus
                            />
                            <textarea
                              value={lessonForm.description}
                              onChange={(e) =>
                                setLessonForm({
                                  ...lessonForm,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Mô tả bài học"
                              rows="2"
                              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                            />
                            <div className="flex gap-3">
                              <select
                                value={lessonForm.type}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    type: e.target.value,
                                  })
                                }
                                className="px-3 py-2 border rounded-lg text-sm"
                              >
                                <option value="Video">Video</option>
                                <option value="Text">Văn bản</option>
                              </select>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={lessonForm.isFree}
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      isFree: e.target.checked,
                                    })
                                  }
                                />
                                <span className="text-sm">Miễn phí</span>
                              </label>
                            </div>
                            {lessonForm.type === "Text" && (
                              <textarea
                                value={lessonForm.content}
                                onChange={(e) =>
                                  setLessonForm({
                                    ...lessonForm,
                                    content: e.target.value,
                                  })
                                }
                                placeholder="Nội dung bài học..."
                                rows="4"
                                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                              />
                            )}
                            {lessonForm.type === "Video" && (
                              <div>
                                <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-purple-100">
                                  <Upload className="w-4 h-4" />
                                  <span className="text-sm">
                                    {lessonForm.videoFile
                                      ? lessonForm.videoFile.name
                                      : "Chọn video"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) =>
                                      setLessonForm({
                                        ...lessonForm,
                                        videoFile: e.target.files[0],
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                            <div>
                              <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-purple-100">
                                <FileDown className="w-4 h-4" />
                                <span className="text-sm">
                                  {lessonForm.pdfFile
                                    ? lessonForm.pdfFile.name
                                    : "Tài liệu PDF (không bắt buộc)"}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) =>
                                    setLessonForm({
                                      ...lessonForm,
                                      pdfFile: e.target.files[0],
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveLesson(section.id)}
                                disabled={loading || !lessonForm.title.trim()}
                                size="sm"
                                className="bg-purple-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Thêm bài học
                              </Button>
                              <Button
                                onClick={() => setAddingItemToSection(null)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Hủy
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Add Quiz Form */}
                    {addingItemToSection?.sectionId === section.id &&
                      addingItemToSection.type === "quiz" && (
                        <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={quizForm.title}
                              onChange={(e) =>
                                setQuizForm({
                                  ...quizForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Tên quiz"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              autoFocus
                            />
                            <textarea
                              value={quizForm.description}
                              onChange={(e) =>
                                setQuizForm({
                                  ...quizForm,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Mô tả quiz"
                              rows="2"
                              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">
                                  Điểm đạt (%)
                                </label>
                                <input
                                  type="number"
                                  value={quizForm.passPercent}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseInt(e.target.value);
                                    setQuizForm({
                                      ...quizForm,
                                      passPercent: value,
                                    });
                                  }}
                                  min="0"
                                  max="100"
                                  step="1"
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">
                                  Thời gian (phút)
                                </label>
                                <input
                                  type="number"
                                  value={quizForm.timer}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseInt(e.target.value);
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
                                onClick={() => handleSaveQuiz(section.id)}
                                disabled={loading || !quizForm.title.trim()}
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Tạo quiz
                              </Button>
                              <Button
                                onClick={() => setAddingItemToSection(null)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Hủy
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Add Content Button */}
                  {!addingItemToSection && (
                    <button
                      onClick={() => handleAddContentClick(section.id)}
                      className="w-full p-3 border-2 border-dashed rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-sm font-medium text-gray-600 hover:text-purple-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm nội dung
                    </button>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có chương nào
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                Bắt đầu tạo chương đầu tiên
              </p>
              <Button
                onClick={handleAddSectionClick}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo chương
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CurriculumTab;
