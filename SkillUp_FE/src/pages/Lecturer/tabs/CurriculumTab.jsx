// src/pages/Lecturer/tabs/CurriculumTab.jsx
import { useState, useEffect } from "react";
import { Plus, FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { createSection, updateSection, deleteSection } from "@/api/sectionAPI";
import { createLesson, updateLesson, deleteLesson } from "@/api/lessonAPI";
import { createQuiz, updateQuiz, deleteQuiz } from "@/api/quizAPI";
import SectionCard from "../components/SectionCard";

function CurriculumTab({ course, courseId, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [localCourse, setLocalCourse] = useState(course);

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

  useEffect(() => {
    setLocalCourse(course);
  }, [course]);

  const displayCourse = localCourse || course;

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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

    try {
      let nextOrder = 1;
      if (displayCourse?.sections?.length > 0) {
        const maxOrder = Math.max(
          ...displayCourse.sections.map((s) => s.orders || 0)
        );
        nextOrder = maxOrder + 1;
      }

      const result = await createSection({
        courseId: courseId,
        title: sectionForm.title,
        description: sectionForm.description,
        orders: nextOrder,
      });

      if (result) {
        setShowAddSection(false);
        setSectionForm({ title: "", description: "" });

        toast.success(`✅ Chương đã được tạo (Thứ tự: ${nextOrder})!`);

        try {
          await onUpdate();
        } catch (updateError) {
          console.error("Error updating course:", updateError);
          toast.warning("Vui lòng làm mới trang để xem cập nhật đầy đủ.");
        }
      }
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error("Không thể tạo chương. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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

    try {
      const result = await updateSection(sectionId, {
        title: sectionForm.title,
        description: sectionForm.description,
      });

      if (result) {
        setEditingSectionId(null);
        setSectionForm({ title: "", description: "" });

        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  title: sectionForm.title,
                  description: sectionForm.description,
                }
              : section
          );
          return newCourse;
        });

        toast.success("Chương đã được cập nhật!");

        try {
          await onUpdate();
        } catch (updateError) {
          console.error("Error syncing:", updateError);
        }
      }
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Không thể cập nhật chương.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm("Xóa chương này?")) {
      setLoading(true);

      try {
        await deleteSection(sectionId);

        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.filter(
            (section) => section.id !== sectionId
          );
          return newCourse;
        });

        toast.success("Chương đã được xóa!");

        try {
          await onUpdate();
        } catch (updateError) {
          console.error("Error syncing:", updateError);
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        toast.error("Không thể xóa chương.");
      } finally {
        setLoading(false);
      }
    }
  };

  // ========== CONTENT TYPE SELECTION ==========
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

  // ========== LESSON HANDLERS ==========
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
      const nextOrder = maxOrder + 1;

      const tempId = `temp-${Date.now()}`;

      // Save form before clearing
      const savedLessonForm = { ...lessonForm };

      // Add optimistically to local state
      const optimisticLesson = {
        kind: "Lesson",
        id: tempId,
        orders: nextOrder,
        title: savedLessonForm.title.trim(),
        description: savedLessonForm.description.trim(),
        lessonType: savedLessonForm.type,
        isFree: savedLessonForm.isFree,
        assets: [
          {
            url:
              savedLessonForm.type === "Video" ? "uploading..." : "default-url",
            content:
              savedLessonForm.type === "Text"
                ? savedLessonForm.content.trim()
                : "No content",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLocalCourse((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const newCourse = { ...prevCourse };
        newCourse.sections = newCourse.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: [...(section.items || []), optimisticLesson],
            };
          }
          return section;
        });
        return newCourse;
      });

      // Keep section expanded
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));

      // Clear form
      setAddingItemToSection(null);
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

      // Create in backend
      const result = await createLesson({
        sectionId: sectionId,
        title: savedLessonForm.title.trim(),
        description: savedLessonForm.description.trim(),
        type: savedLessonForm.type,
        isFree: savedLessonForm.isFree,
        lessonOrder: nextOrder,
        content:
          savedLessonForm.type === "Text" ? savedLessonForm.content.trim() : "",
        videoFile:
          savedLessonForm.type === "Video" ? savedLessonForm.videoFile : null,
        fileUrl: savedLessonForm.pdfFile || null,
      });

      console.log("📥 Backend response:", result);
      console.log(
        "📊 Type:",
        typeof result,
        "| Is array:",
        Array.isArray(result),
        "| Length:",
        Array.isArray(result) ? result.length : "N/A"
      );

      // ✅ Extract real ID from backend response
      let realId = null;

      // Check if result is an array with items
      if (Array.isArray(result)) {
        if (result.length > 0 && result[0]?.id) {
          realId = result[0].id;
          console.log("✅ Extracted ID from array[0]:", realId);
        } else if (result.length === 0) {
          console.warn(
            "⚠️ Backend returned empty array - lesson may be created but ID unavailable"
          );
        }
      }
      // Check if result is an object with id
      else if (result && typeof result === "object" && result.id) {
        realId = result.id;
        console.log("✅ Extracted ID from object:", realId);
      }
      // Check if result is direct ID (string or number)
      else if (typeof result === "string" || typeof result === "number") {
        realId = result;
        console.log("✅ Using direct ID:", realId);
      }

      // If we got a real ID, replace the temp ID
      if (realId) {
        console.log("🔄 Replacing temp ID:", tempId, "with real ID:", realId);

        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) => {
            if (section.id === sectionId) {
              return {
                ...section,
                items: section.items?.map((item) =>
                  item.id === tempId ? { ...item, id: realId } : item
                ),
              };
            }
            return section;
          });
          return newCourse;
        });

        toast.success(`✅ Bài học đã được tạo (Thứ tự: ${nextOrder})`);
      } else {
        // Keep temp ID but warn user
        console.warn(
          "⚠️ Could not extract real ID from backend - keeping temp ID"
        );
      }
    } catch (error) {
      console.error("❌ Error saving lesson:", error);
      toast.error("Lỗi khi tạo bài học");

      // On error, remove the optimistic item
      setLocalCourse((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const newCourse = { ...prevCourse };
        newCourse.sections = newCourse.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items?.filter(
                (item) => !String(item.id).startsWith("temp-")
              ),
            };
          }
          return section;
        });
        return newCourse;
      });
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

      setLocalCourse((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const newCourse = { ...prevCourse };
        newCourse.sections = newCourse.sections.map((section) => ({
          ...section,
          items: section.items?.map((item) =>
            item.id === lessonId
              ? {
                  ...item,
                  title: lessonForm.title,
                  description: lessonForm.description,
                  isFree: lessonForm.isFree,
                  orders: lessonForm.lessonOrder,
                }
              : item
          ),
        }));
        return newCourse;
      });

      toast.success("Bài học đã được cập nhật!");
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (lessonId) => {
    // Convert to string and check if this is a temp ID
    const idString = String(lessonId);
    if (idString.startsWith("temp-")) {
      toast.error("Bài học đang được tải lên. Vui lòng đợi...");
      return;
    }

    if (window.confirm("Xóa bài học này?")) {
      setLoading(true);
      try {
        await deleteLesson(lessonId);

        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) => ({
            ...section,
            items: section.items?.filter((item) => item.id !== lessonId),
          }));
          return newCourse;
        });

        toast.success("Bài học đã được xóa!");
      } catch (error) {
        console.error("Delete lesson error:", error);
        toast.error("Lỗi khi xóa bài học");
      } finally {
        setLoading(false);
      }
    }
  };

  // ========== QUIZ HANDLERS ==========
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
      const section = displayCourse?.sections?.find((s) => s.id === sectionId);
      let nextOrder = 1;

      if (section?.items && section.items.length > 0) {
        const maxOrder = Math.max(
          ...section.items.map((item) => item.orders || 0)
        );
        nextOrder = maxOrder + 1;
      }

      const tempId = `temp-${Date.now()}`;

      const quizData = {
        sectionId: sectionId,
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passPercent: passPercent,
        timer: timer,
        orders: nextOrder,
      };

      console.log("📤 Creating quiz:", quizData);

      // Add optimistically
      const optimisticQuiz = {
        kind: "Quiz",
        id: tempId,
        ...quizData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLocalCourse((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const newCourse = { ...prevCourse };
        newCourse.sections = newCourse.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: [...(section.items || []), optimisticQuiz],
            };
          }
          return section;
        });
        return newCourse;
      });

      // Keep section expanded
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));

      // Clear form
      setAddingItemToSection(null);
      setQuizForm({
        title: "",
        description: "",
        passPercent: 70,
        timer: 15,
      });

      // Create in backend
      const result = await createQuiz(quizData);

      console.log("📥 Backend quiz response:", result);
      console.log(
        "📊 Type:",
        typeof result,
        "| Is array:",
        Array.isArray(result),
        "| Length:",
        Array.isArray(result) ? result.length : "N/A"
      );

      // ✅ Extract real ID from backend response
      let realId = null;

      // Check if result is an array with items
      if (Array.isArray(result)) {
        if (result.length > 0 && result[0]?.id) {
          realId = result[0].id;
          console.log("✅ Extracted quiz ID from array[0]:", realId);
        } else if (result.length === 0) {
          console.warn(
            "⚠️ Backend returned empty array - quiz may be created but ID unavailable"
          );
        }
      }
      // Check if result is an object with id
      else if (result && typeof result === "object" && result.id) {
        realId = result.id;
        console.log("✅ Extracted quiz ID from object:", realId);
      }
      // Check if result is direct ID (string or number)
      else if (typeof result === "string" || typeof result === "number") {
        realId = result;
        console.log("✅ Using direct quiz ID:", realId);
      }

      // If we got a real ID, replace the temp ID
      if (realId) {
        console.log(
          "🔄 Replacing temp quiz ID:",
          tempId,
          "with real ID:",
          realId
        );

        setLocalCourse((prevCourse) => {
          if (!prevCourse) return prevCourse;
          const newCourse = { ...prevCourse };
          newCourse.sections = newCourse.sections.map((section) => {
            if (section.id === sectionId) {
              return {
                ...section,
                items: section.items?.map((item) =>
                  item.id === tempId ? { ...item, id: realId } : item
                ),
              };
            }
            return section;
          });
          return newCourse;
        });

        toast.success(`✅ Quiz đã được tạo (Thứ tự: ${nextOrder})`);
      } else {
        // Keep temp ID but warn user
        console.warn(
          "⚠️ Could not extract real quiz ID from backend - keeping temp ID"
        );
        toast.warning(
          "⚠️ Quiz đã được tạo nhưng chưa có ID. Vui lòng làm mới trang để xóa hoặc chỉnh sửa."
        );
      }
    } catch (error) {
      console.error("❌ Quiz creation error:", error);
      toast.error("Lỗi khi tạo quiz");

      // On error, remove the optimistic item
      setLocalCourse((prevCourse) => {
        if (!prevCourse) return prevCourse;
        const newCourse = { ...prevCourse };
        newCourse.sections = newCourse.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items?.filter(
                (item) => !String(item.id).startsWith("temp-")
              ),
            };
          }
          return section;
        });
        return newCourse;
      });
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
    // Convert to string and check if this is a temp ID
    const idString = String(quizId);
    if (idString.startsWith("temp-")) {
      toast.error("Quiz đang được tạo. Vui lòng đợi...");
      return;
    }

    if (window.confirm("Xóa quiz này?")) {
      setLoading(true);
      try {
        await deleteQuiz(quizId);

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

  const sortedSections = displayCourse?.sections
    ? [...displayCourse.sections].sort(
        (a, b) => (a.orders || 0) - (b.orders || 0)
      )
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Nội dung khóa học
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {sortedSections.length || 0} chương
          </p>
        </div>
        <Button
          onClick={handleAddSectionClick}
          disabled={loading || showAddSection}
          className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Chương mới
        </Button>
      </div>

      {/* Add Section Form */}
      {showAddSection && (
        <Card className="mb-4 border-2 border-[#FFD54F]/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên chương (VD: Chương 1: Giới thiệu)"
                value={sectionForm.title}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFD54F]"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFD54F] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSection}
                  disabled={loading || !sectionForm.title.trim()}
                  size="sm"
                  className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold"
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
        {sortedSections.length > 0 ? (
          sortedSections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isExpanded={expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              onEdit={handleEditSectionClick}
              onDelete={handleDeleteSection}
              onAddContent={handleAddContentClick}
              onSaveLesson={handleSaveLesson}
              onSaveQuiz={handleSaveQuiz}
              onEditLesson={handleEditLessonClick}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
              onEditQuiz={handleEditQuizClick}
              onUpdateQuiz={handleUpdateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              loading={loading}
              editingSectionId={editingSectionId}
              sectionForm={sectionForm}
              setSectionForm={setSectionForm}
              onUpdateSection={handleUpdateSection}
              onCancelEditSection={() => setEditingSectionId(null)}
              addingItemToSection={addingItemToSection}
              onSelectContentType={handleSelectContentType}
              onCancelAddContent={() => setAddingItemToSection(null)}
              lessonForm={lessonForm}
              setLessonForm={setLessonForm}
              quizForm={quizForm}
              setQuizForm={setQuizForm}
              editingLessonId={editingLessonId}
              setEditingLessonId={setEditingLessonId}
              editingQuizId={editingQuizId}
              setEditingQuizId={setEditingQuizId}
              courseId={courseId}
            />
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
                className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold"
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
