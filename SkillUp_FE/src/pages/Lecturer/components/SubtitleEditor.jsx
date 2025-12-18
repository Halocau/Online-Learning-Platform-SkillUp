import { useState, useEffect } from "react";
import { X, Save, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getLessonSubtitle, updateLessonSubtitle } from "@/api/subtitleAPI";
import { toast } from "react-toastify";

function SubtitleEditor({ lessonId, lessonTitle, isOpen, onClose, onSuccess }) {
    const [subtitle, setSubtitle] = useState("");
    const [originalSubtitle, setOriginalSubtitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (isOpen && lessonId) {
            loadSubtitle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, lessonId]);

    const loadSubtitle = async () => {
        try {
            setLoading(true);
            const data = await getLessonSubtitle(lessonId);
            if (data) {
                setSubtitle(data.subtitleText || "");
                setOriginalSubtitle(data.subtitleText || "");
                setHasChanges(false);
            } else {
                setSubtitle("");
                setOriginalSubtitle("");
                setHasChanges(false);
                toast.info("Bài học này chưa có phụ đề");
            }
        } catch (error) {
            console.error("Error loading subtitle:", error);
            toast.error("Không thể tải phụ đề");
        } finally {
            setLoading(false);
        }
    };

    const handleSubtitleChange = (e) => {
        const newValue = e.target.value;
        setSubtitle(newValue);
        setHasChanges(newValue !== originalSubtitle);
    };

    const handleSave = async () => {
        if (!subtitle.trim()) {
            toast.error("Phụ đề không được để trống");
            return;
        }

        try {
            setSaving(true);
            await updateLessonSubtitle(lessonId, subtitle);
            setOriginalSubtitle(subtitle);
            setHasChanges(false);
            toast.success("Cập nhật phụ đề thành công!");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Cập nhật phụ đề thất bại"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            if (
                window.confirm(
                    "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?"
                )
            ) {
                setSubtitle(originalSubtitle);
                setHasChanges(false);
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <DialogTitle className="text-xl font-bold">
                            Chỉnh sửa phụ đề
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {lessonTitle && (
                            <span className="text-sm text-gray-600">
                                Bài học: <strong>{lessonTitle}</strong>
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Đang tải phụ đề...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung phụ đề
                                </label>
                                <textarea
                                    value={subtitle}
                                    onChange={handleSubtitleChange}
                                    placeholder="Nhập nội dung phụ đề..."
                                    rows={20}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Số ký tự: {subtitle.length} | Số từ:{" "}
                                    {subtitle.trim().split(/\s+/).filter(Boolean).length}
                                </p>
                            </div>

                            {subtitle && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">
                                        💡 Lưu ý:
                                    </p>
                                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                        <li>
                                            Sau khi lưu, hệ thống sẽ tự động cập nhật lại dữ liệu
                                            cho AI Chat
                                        </li>
                                        <li>
                                            Phụ đề đã chỉnh sửa sẽ được đánh dấu là đã xác nhận
                                        </li>
                                        <li>
                                            Học viên có thể sử dụng AI Chat ngay sau khi bạn lưu
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        {hasChanges && (
                            <span className="text-orange-600 font-medium">
                                ⚠️ Có thay đổi chưa lưu
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={saving}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !hasChanges || !subtitle.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SubtitleEditor;

