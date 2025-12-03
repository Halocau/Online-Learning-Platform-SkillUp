// src/pages/Lecturer/tabs/components/LessonForm. jsx
import { useRef, useEffect } from "react";
import { Check, X, Upload, FileDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/Editor/RichText";

function LessonForm({
  lessonForm,
  setLessonForm,
  onSave,
  onCancel,
  loading,
  isEditMode = false,
}) {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    setLessonForm({ ...lessonForm, content });
  };

  const getVideoFileName = (url) => {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const existingVideoUrl = lessonForm.existingVideoUrl || lessonForm.videoUrl;
  const hasExistingVideo =
    isEditMode && existingVideoUrl && !lessonForm.videoFile;

  return (
    <div className="p-3 bg-[#FFD54F]/10 border-2 border-[#FFD54F]/30 rounded-lg">
      <div className="space-y-2">
        <input
          type="text"
          value={lessonForm.title}
          onChange={(e) =>
            setLessonForm({ ...lessonForm, title: e.target.value })
          }
          placeholder="Tên bài học"
          className="w-full px-3 py-2 border rounded-lg text-sm"
          autoFocus
        />
        <textarea
          value={lessonForm.description}
          onChange={(e) =>
            setLessonForm({ ...lessonForm, description: e.target.value })
          }
          placeholder="Mô tả bài học"
          rows="2"
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
        />
        <div className="flex gap-3">
          <select
            value={lessonForm.type}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, type: e.target.value })
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
                setLessonForm({ ...lessonForm, isFree: e.target.checked })
              }
            />
            <span className="text-sm">Miễn phí</span>
          </label>
        </div>

        {/* RichTextEditor for Text Type */}
        {lessonForm.type === "Text" && (
          <div className="border rounded-lg overflow-hidden">
            <RichTextEditor
              value={lessonForm.content}
              onChange={handleEditorChange}
              onReady={(editor) => {
                editorRef.current = editor;
              }}
              placeholder="Nhập nội dung bài học..."
              minHeight={300}
              maxHeight={600}
            />
          </div>
        )}

        {/* Video Upload for Video Type */}
        {lessonForm.type === "Video" && (
          <div className="space-y-2">
            {/* Show existing video info in edit mode */}
            {hasExistingVideo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      Video hiện tại:
                    </p>
                    <p className="text-sm text-blue-700 truncate">
                      {getVideoFileName(existingVideoUrl)}
                    </p>
                  </div>
                  <a
                    href={existingVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800"
                    title="Xem video"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* File upload */}
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#FFD54F]/20">
              <Upload className="w-4 h-4" />
              <span className="text-sm">
                {lessonForm.videoFile
                  ? lessonForm.videoFile.name
                  : hasExistingVideo
                  ? "Tải lên video mới (tùy chọn)"
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

            {/* Show option to clear newly selected file */}
            {lessonForm.videoFile && (
              <button
                type="button"
                onClick={() =>
                  setLessonForm({ ...lessonForm, videoFile: null })
                }
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Xóa video đã chọn
              </button>
            )}
          </div>
        )}

        {/* PDF Upload */}
        <div className="space-y-2">
          {/* Show existing PDF info in edit mode */}
          {isEditMode && lessonForm.existingPdfUrl && !lessonForm.pdfFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-900 mb-1">
                    Tài liệu PDF hiện tại:
                  </p>
                  <p className="text-sm text-green-700 truncate">
                    {lessonForm.existingPdfUrl.split("/").pop()}
                  </p>
                </div>
                <a
                  href={lessonForm.existingPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1 text-green-600 hover:text-green-800"
                  title="Xem PDF"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#FFD54F]/20">
            <FileDown className="w-4 h-4" />
            <span className="text-sm">
              {lessonForm.pdfFile
                ? lessonForm.pdfFile.name
                : isEditMode && lessonForm.existingPdfUrl
                ? "Tải lên PDF mới (tùy chọn)"
                : "Tài liệu PDF (tùy chọn)"}
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setLessonForm({ ...lessonForm, pdfFile: e.target.files[0] })
              }
              className="hidden"
            />
          </label>

          {lessonForm.pdfFile && (
            <button
              type="button"
              onClick={() => setLessonForm({ ...lessonForm, pdfFile: null })}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Xóa PDF đã chọn
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading || !lessonForm.title.trim()}
            size="sm"
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold"
          >
            <Check className="w-4 h-4 mr-1" />
            {isEditMode ? "Cập nhật bài học" : "Thêm bài học"}
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

export default LessonForm;
