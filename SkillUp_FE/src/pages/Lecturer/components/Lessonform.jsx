// src/pages/Lecturer/tabs/components/LessonForm.jsx
import { useRef, useEffect } from "react";
import { Check, X, Upload, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Editor } from "@tinymce/tinymce-react";
import { TINYMCE_API_KEY } from "@/config/api";

function LessonForm({ lessonForm, setLessonForm, onSave, onCancel, loading }) {
  const editorRef = useRef(null);

  // Initialize TinyMCE content when switching to Text type
  useEffect(() => {
    if (lessonForm.type === "Text" && editorRef.current) {
      editorRef.current.setContent(lessonForm.content || "");
    }
  }, [lessonForm.type]);

  const handleEditorChange = (content) => {
    setLessonForm({ ...lessonForm, content });
  };

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

        {/* TinyMCE Editor for Text Type */}
        {lessonForm.type === "Text" && (
          <div className="border rounded-lg overflow-hidden">
            <Editor
              apiKey={TINYMCE_API_KEY}
              onInit={(evt, editor) => (editorRef.current = editor)}
              value={lessonForm.content}
              onEditorChange={handleEditorChange}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic forecolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                placeholder: "Nhập nội dung bài học...",
              }}
            />
          </div>
        )}

        {/* Video Upload for Video Type */}
        {lessonForm.type === "Video" && (
          <div>
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#FFD54F]/20">
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

        {/* PDF Upload (Optional) */}
        <div>
          <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#FFD54F]/20">
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
                setLessonForm({ ...lessonForm, pdfFile: e.target.files[0] })
              }
              className="hidden"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading || !lessonForm.title.trim()}
            size="sm"
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold"
          >
            <Check className="w-4 h-4 mr-1" />
            Thêm bài học
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
