// src/pages/Lecturer/tabs/components/ItemCard.jsx
import {
  Video,
  FileText,
  HelpCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ItemCard({
  item,
  onEdit,
  onDelete,
  isEditing,
  editForm,
  setEditForm,
  onUpdate,
  onCancelEdit,
}) {
  const getLessonIcon = () => {
    if (item.lessonType === "Video") {
      return <Video className="w-4 h-4 text-[#FFA726]" />;
    }
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  if (isEditing) {
    // Edit mode
    if (item.kind === "Lesson") {
      return (
        <div className="p-3 bg-yellow-50 border rounded">
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="Tên bài học"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Mô tả"
              rows="2"
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
            />
            <div className="flex gap-3">
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="Video">Video</option>
                <option value="Text">Văn bản</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isFree}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isFree: e.target.checked })
                  }
                />
                <span className="text-sm">Miễn phí</span>
              </label>
            </div>
            {editForm.type === "Text" && (
              <textarea
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                placeholder="Nội dung bài học..."
                rows="4"
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              />
            )}
            {editForm.type === "Video" && (
              <div>
                <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {editForm.videoFile
                      ? editForm.videoFile.name
                      : "Chọn video mới"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                  {editForm.pdfFile
                    ? editForm.pdfFile.name
                    : "Tài liệu PDF (không bắt buộc)"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setEditForm({ ...editForm, pdfFile: e.target.files[0] })
                  }
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onUpdate(item.id)}
                size="sm"
                className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900"
              >
                <Check className="w-3 h-3 mr-1" />
                Lưu
              </Button>
              <Button onClick={onCancelEdit} variant="outline" size="sm">
                <X className="w-3 h-3 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      // Quiz edit mode
      return (
        <div className="p-3 bg-yellow-50 border rounded">
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="Tên quiz"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Mô tả"
              rows="2"
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Điểm đạt (%)</label>
                <input
                  type="number"
                  value={editForm.passPercent}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value);
                    setEditForm({ ...editForm, passPercent: value });
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
                  value={editForm.timer}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value);
                    setEditForm({ ...editForm, timer: value });
                  }}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onUpdate(item.id)}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                Lưu
              </Button>
              <Button onClick={onCancelEdit} variant="outline" size="sm">
                <X className="w-3 h-3 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Display mode
  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow-sm">
      {item.kind === "Lesson" && getLessonIcon()}
      {item.kind === "Quiz" && (
        <HelpCircle className="w-4 h-4 text-orange-500" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded font-semibold text-xs">
            {item.orders}
          </span>
          <span className="text-xs text-gray-500">
            {item.kind === "Lesson" ? "Bài học" : "Quiz"}
          </span>
          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
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
              Pass: {item.passPercent}% • {item.timer} phút
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => onEdit(item)}
          className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 hover:bg-red-100 rounded text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ItemCard;