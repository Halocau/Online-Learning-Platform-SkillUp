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
import ConfirmModal from "../components/ConfirmModal";

function CurriculumTab({ course, courseId, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [localCourse, setLocalCourse] = useState(course);

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
    loading: false,
  });

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

  // Confirm modal helpers
  const openConfirmModal = (config) => {
    setConfirmModal({
      isOpen: true,
      loading: false,
      ...config,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      type: "warning",
      onConfirm: null,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.onConfirm) {
      setConfirmModal((prev) => ({ ...prev, loading: true }));
      await confirmModal.onConfirm();
      closeConfirmModal();
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const extractId = (result, itemType = "item") => {
    if (Array.isArray(result)) {
      if (result.length === 0) {
        console.warn(`⚠️ Empty array returned for ${itemType}`);
        return null;
      }

      const firstItem = result[0];

      if (firstItem?.id) return firstItem.id;
      if (firstItem?.lessonId) return firstItem.lessonId;
      if (firstItem?.quizId) return firstItem.quizId;
      if (typeof firstItem === "string" || typeof firstItem === "number") {
        return firstItem;
      }

      return null;
    }

    if (result && typeof result === "object" && !Array.isArray(result)) {
      if (result.id) return result.id;
      if (result.lessonId) return result.lessonId;
      if (result.quizId) return result.quizId;

      if (result.data) {
        if (Array.isArray(result.data) && result.data.length > 0) {
          if (result.data[0]?.id) return result.data[0].id;
          if (result.data[0]?.lessonId) return result.data[0].lessonId;
          if (result.data[0]?.quizId) return result.data[0].quizId;
        } else if (result.data && typeof result.data === "object") {
          if (result.data.id) return result.data.id;
          if (result.data.lessonId) return result.data.lessonId;
          if (result.data.quizId) return result.data.quizId;
        }
      }
      return null;
    }

    if (typeof result === "string" || typeof result === "number") {
      return result;
    }

    return null;
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
          await onUpdate({ showSuccess: false });
        } catch (updateError) {
          console.error("Error updating course:", updateError);
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
          await onUpdate({ showSuccess: false });
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
    openConfirmModal({
      title: "Xóa chương",
      message:
        "Bạn có chắc chắn muốn xóa chương này? Tất cả nội dung trong chương sẽ bị xóa.",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
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
            await onUpdate({ showSuccess: false });
          } catch (updateError) {
            console.error("Error syncing:", updateError);
          }
        } catch (error) {
          console.error("Error deleting section:", error);
          toast.error("Không thể xóa chương.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Content type handlers
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
      const nextOrder = maxOrder + 1;

      const result = await createLesson({
        sectionId: sectionId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        type: lessonForm.type,
        isFree: lessonForm.isFree,
        lessonOrder: nextOrder,
        content: lessonForm.type === "Text" ? lessonForm.content.trim() : "",
        videoFile: lessonForm.type === "Video" ? lessonForm.videoFile : null,
        fileUrl: lessonForm.pdfFile || null,
      });

      const lessonId = extractId(result, "lesson");

      if (!lessonId) {
        console.error("❌ Full API response:", JSON.stringify(result, null, 2));
        toast.warning("Bài học đã được tạo. Đang làm mới dữ liệu...");
        await onUpdate({ showSuccess: false });
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
        return;
      }

      const newLesson = {
        kind: "Lesson",
        id: lessonId,
        orders: nextOrder,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        lessonType: lessonForm.type,
        isFree: lessonForm.isFree,
        assets: [
          {
            url: lessonForm.type === "Video" ? "processing..." : "default-url",
            content:
              lessonForm.type === "Text"
                ? lessonForm.content.trim()
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
              items: [...(section.items || []), newLesson],
            };
          }
          return section;
        });
        return newCourse;
      });

      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));

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

      toast.success(`✅ Bài học đã được tạo (Thứ tự: ${nextOrder})`);

      try {
        await onUpdate({ showSuccess: false });
      } catch (updateError) {
        console.error("Error triggering tab update:", updateError);
      }
    } catch (error) {
      console.error("❌ Error saving lesson:", error);
      toast.error(error.message || "Lỗi khi tạo bài học");
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

    try {
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
    } catch (error) {
      console.error("Update lesson error:", error);
      toast.error("Lỗi khi cập nhật bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    openConfirmModal({
      title: "Xóa bài học",
      message: "Bạn có chắc chắn muốn xóa bài học này?",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
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

          try {
            await onUpdate({ showSuccess: false });
          } catch (updateError) {
            console.error("Error updating tab:", updateError);
          }
        } catch (error) {
          console.error("Delete lesson error:", error);
          toast.error("Lỗi khi xóa bài học");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Quiz handlers
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

      const quizData = {
        sectionId: sectionId,
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passPercent: passPercent,
        timer: timer,
        orders: nextOrder,
      };

      const result = await createQuiz(quizData);
      const quizId = extractId(result, "quiz");

      if (!quizId) {
        console.error("❌ Full API response:", JSON.stringify(result, null, 2));
        toast.warning("Quiz đã được tạo. Đang làm mới dữ liệu...");
        await onUpdate({ showSuccess: false });
        setAddingItemToSection(null);
        setQuizForm({
          title: "",
          description: "",
          passPercent: 70,
          timer: 15,
        });
        return;
      }

      const newQuiz = {
        kind: "Quiz",
        id: quizId,
        orders: nextOrder,
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passPercent: passPercent,
        timer: timer,
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
              items: [...(section.items || []), newQuiz],
            };
          }
          return section;
        });
        return newCourse;
      });

      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));

      setAddingItemToSection(null);
      setQuizForm({
        title: "",
        description: "",
        passPercent: 70,
        timer: 15,
      });

      toast.success(`✅ Quiz đã được tạo (Thứ tự: ${nextOrder})`);

      try {
        await onUpdate({ showSuccess: false });
      } catch (updateError) {
        console.error("Error triggering tab update:", updateError);
      }
    } catch (error) {
      console.error("❌ Quiz creation error:", error);
      toast.error(error.message || "Lỗi khi tạo quiz");
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
    openConfirmModal({
      title: "Xóa quiz",
      message:
        "Bạn có chắc chắn muốn xóa quiz này? Tất cả câu hỏi trong quiz sẽ bị xóa.",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
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

          try {
            await onUpdate({ showSuccess: false });
          } catch (updateError) {
            console.error("Error updating tab:", updateError);
          }
        } catch (error) {
          console.error("Delete quiz error:", error);
          toast.error("Lỗi khi xóa quiz");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const sortedSections = displayCourse?.sections
    ? [...displayCourse.sections].sort(
        (a, b) => (a.orders || 0) - (b.orders || 0)
      )
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        loading={confirmModal.loading}
      />

      <CurriculumHeader
        sectionCount={sortedSections.length}
        loading={loading}
        showAddSection={showAddSection}
        onAddSectionClick={handleAddSectionClick}
      />

      {showAddSection && (
        <AddSectionForm
          loading={loading}
          sectionForm={sectionForm}
          setSectionForm={setSectionForm}
          onSaveSection={handleSaveSection}
          onCancel={() => {
            setShowAddSection(false);
            setSectionForm({ title: "", description: "" });
          }}
        />
      )}

      <SectionsList
        sections={sortedSections}
        loading={loading}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        onEditSection={handleEditSectionClick}
        onDeleteSection={handleDeleteSection}
        editingSectionId={editingSectionId}
        sectionForm={sectionForm}
        setSectionForm={setSectionForm}
        onUpdateSection={handleUpdateSection}
        onCancelEditSection={() => setEditingSectionId(null)}
        addingItemToSection={addingItemToSection}
        onAddContent={handleAddContentClick}
        onSelectContentType={handleSelectContentType}
        onCancelAddContent={() => setAddingItemToSection(null)}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        onSaveLesson={handleSaveLesson}
        onEditLesson={handleEditLessonClick}
        onUpdateLesson={handleUpdateLesson}
        onDeleteLesson={handleDeleteLesson}
        editingLessonId={editingLessonId}
        setEditingLessonId={setEditingLessonId}
        quizForm={quizForm}
        setQuizForm={setQuizForm}
        onSaveQuiz={handleSaveQuiz}
        onEditQuiz={handleEditQuizClick}
        onUpdateQuiz={handleUpdateQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        editingQuizId={editingQuizId}
        setEditingQuizId={setEditingQuizId}
        courseId={courseId}
        onAddSectionClick={handleAddSectionClick}
      />
    </div>
  );
}

// Sub-components (same as before)

function CurriculumHeader({
  sectionCount,
  loading,
  showAddSection,
  onAddSectionClick,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[#272343] tracking-tight">
          Nội dung khóa học
        </h2>
        <p className="text-sm text-[#2d334a] mt-1">
          {sectionCount || 0} chương
        </p>
      </div>
      <Button
        onClick={onAddSectionClick}
        disabled={loading || showAddSection}
        className="bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold rounded-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Chương mới
      </Button>
    </div>
  );
}

function AddSectionForm({
  loading,
  sectionForm,
  setSectionForm,
  onSaveSection,
  onCancel,
}) {
  return (
    <Card className="mb-4 border-2 border-[#FFD54F]/30 rounded-2xl">
      <CardContent className="p-4">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tên chương (VD: Chương 1: Giới thiệu)"
            value={sectionForm.title}
            onChange={(e) =>
              setSectionForm({ ...sectionForm, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#272343]/15 rounded-lg focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent"
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
            className="w-full px-3 py-2 border border-[#272343]/15 rounded-lg focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={onSaveSection}
              disabled={loading || !sectionForm.title.trim()}
              size="sm"
              className="bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold rounded-full"
            >
              <Check className="w-4 h-4 mr-1" />
              Lưu
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="rounded-full border-[#272343]/15 hover:bg-[#e3f6f5]"
            >
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionsList(props) {
  const {
    sections,
    loading,
    expandedSections,
    onToggleSection,
    onEditSection,
    onDeleteSection,
    onAddContent,
    onSaveLesson,
    onSaveQuiz,
    onEditLesson,
    onUpdateLesson,
    onDeleteLesson,
    onEditQuiz,
    onUpdateQuiz,
    onDeleteQuiz,
    editingSectionId,
    sectionForm,
    setSectionForm,
    onUpdateSection,
    onCancelEditSection,
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
    courseId,
    onAddSectionClick,
  } = props;

  if (!sections.length) {
    return <EmptySectionsState onAddSectionClick={onAddSectionClick} />;
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          index={index}
          isExpanded={expandedSections[section.id]}
          onToggle={() => onToggleSection(section.id)}
          onEdit={onEditSection}
          onDelete={onDeleteSection}
          onAddContent={onAddContent}
          onSaveLesson={onSaveLesson}
          onSaveQuiz={onSaveQuiz}
          onEditLesson={onEditLesson}
          onUpdateLesson={onUpdateLesson}
          onDeleteLesson={onDeleteLesson}
          onEditQuiz={onEditQuiz}
          onUpdateQuiz={onUpdateQuiz}
          onDeleteQuiz={onDeleteQuiz}
          loading={loading}
          editingSectionId={editingSectionId}
          sectionForm={sectionForm}
          setSectionForm={setSectionForm}
          onUpdateSection={onUpdateSection}
          onCancelEditSection={onCancelEditSection}
          addingItemToSection={addingItemToSection}
          onSelectContentType={onSelectContentType}
          onCancelAddContent={onCancelAddContent}
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
      ))}
    </div>
  );
}

function EmptySectionsState({ onAddSectionClick }) {
  return (
    <Card className="border-2 border-dashed border-[#272343]/20 rounded-2xl">
      <CardContent className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-[#e3f6f5]" />
        <h3 className="text-lg font-semibold text-[#272343] mb-2">
          Chưa có chương nào
        </h3>
        <p className="text-[#2d334a] mb-4 text-sm">
          Bắt đầu tạo chương đầu tiên
        </p>
        <Button
          onClick={onAddSectionClick}
          className="bg-[#FFD54F] hover:bg-[#F4C430] text-[#272343] font-semibold rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo chương
        </Button>
      </CardContent>
    </Card>
  );
}

export default CurriculumTab;
