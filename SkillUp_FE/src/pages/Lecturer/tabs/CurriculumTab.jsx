import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSection, updateSection, deleteSection } from "@/api/sectionAPI";
import { createLesson, updateLesson, deleteLesson } from "@/api/lessonAPI";
import { message } from "antd";
import { toast } from "react-toastify";

function CurriculumTab({ course, courseId, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);

  // Form states
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [addingLessonToSection, setAddingLessonToSection] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);

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
  });

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Section handlers
  const handleAddSectionClick = () => {
    setShowAddSection(true);
    setSectionForm({ title: "", description: "" });
  };

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) return;

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
    if (!sectionForm.title.trim()) return;

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

  // Lesson handlers
  const handleAddLessonClick = (sectionId) => {
    setAddingLessonToSection(sectionId);
    setLessonForm({
      title: "",
      description: "",
      type: "Video",
      isFree: false,
      lessonOrder: 0,
      content: "",
      videoFile: null,
    });
  };

  const handleSaveLesson = async (sectionId) => {
    // Validation
    if (!lessonForm.title.trim()) {
      toast.error("Vui lòng nhập tên bài học");
      return;
    }

    if (lessonForm.type === "Video" && !lessonForm.videoFile) {
      toast.error("Vui lòng nhập video cho bài học");
      return;
    }

    if (lessonForm.type === "Text" && !lessonForm.content.trim()) {
      toast.error("Vui lòng nhập nội dung cho bài học");
      return;
    }

    setLoading(true);

    try {
      // Get the current section to calculate lesson order
      const section = course?.sections?.find((s) => s.id === sectionId);
      const maxOrder = section?.items?.length
        ? Math.max(...section.items.map((item) => item.orders || 0))
        : 0;

      const result = await createLesson({
        sectionId: sectionId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        type: lessonForm.type,
        isFree: lessonForm.isFree,
        lessonOrder: maxOrder + 1, // Auto-increment order
        content: lessonForm.type === "Text" ? lessonForm.content.trim() : "",
        videoFile: lessonForm.type === "Video" ? lessonForm.videoFile : null,
      });

      if (result) {
        toast.success("Thêm bài học thành công");
        setAddingLessonToSection(null);
        setLessonForm({
          title: "",
          description: "",
          type: "Video",
          isFree: false,
          lessonOrder: 0,
          content: "",
          videoFile: null,
        });
        await onUpdate();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Không thể thêm bài học");
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
    });
  };

  const handleUpdateLesson = async (lessonId) => {
    if (!lessonForm.title.trim()) return;

    setLoading(true);
    const result = await updateLesson(lessonId, {
      title: lessonForm.title,
      description: lessonForm.description,
      isFree: lessonForm.isFree,
      lessonOrder: lessonForm.lessonOrder,
      content: lessonForm.content,
      videoFile: lessonForm.videoFile,
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
      await deleteLesson(lessonId);
      await onUpdate();
      setLoading(false);
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
            {course?.sections?.length || 0} chương
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
        {course?.sections && course.sections.length > 0 ? (
          course.sections.map((section, index) => (
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
                      {section.items?.length || 0} bài học
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
                          {item.kind === "Lesson" &&
                          editingLessonId === item.id ? (
                            // Edit Lesson Form
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
                          ) : (
                            // Display Lesson
                            <div className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow-sm">
                              {item.kind === "Lesson" && getLessonIcon(item)}
                              {item.kind === "Quiz" && (
                                <HelpCircle className="w-4 h-4 text-orange-500" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {item.kind === "Lesson" ? "Bài" : "Quiz"}{" "}
                                    {item.orders}
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
                                {item.kind === "Lesson" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleEditLessonClick(item)
                                      }
                                      className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(item.id)
                                      }
                                      className="p-2 hover:bg-red-100 rounded text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có bài học</p>
                      </div>
                    )}

                    {/* Add Lesson Form */}
                    {addingLessonToSection === section.id && (
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
                            placeholder="Mô tả bài học (không bắt buộc)"
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
                              onClick={() => setAddingLessonToSection(null)}
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

                  {/* Add Lesson Button */}
                  {addingLessonToSection !== section.id && (
                    <button
                      onClick={() => handleAddLessonClick(section.id)}
                      className="w-full p-3 border-2 border-dashed rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-sm font-medium text-gray-600 hover:text-purple-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm bài học
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
