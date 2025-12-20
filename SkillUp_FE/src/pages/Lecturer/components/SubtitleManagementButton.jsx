import { useState, useEffect } from "react";
import { Subtitles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubtitleEditor from "./SubtitleEditor";
import { getLessonSubtitle } from "@/api/subtitleAPI";

/**
 * Component quản lý Subtitle cho Video Lesson
 * Chỉ hiển thị khi:
 * 1. Khóa học có hỗ trợ AI (isAiSupport = true)
 * 2. Lesson đã có subtitle
 * 
 * Props:
 * - lessonId: ID của lesson
 * - lessonTitle: Tiêu đề lesson
 * - courseIsAiSupport: Boolean - Khóa học có hỗ trợ AI không
 * - onSubtitleUpdated: Callback khi subtitle được cập nhật
 */
function SubtitleManagementButton({
    lessonId,
    lessonTitle,
    courseIsAiSupport = false,
    onSubtitleUpdated,
}) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [hasSubtitle, setHasSubtitle] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Kiểm tra xem lesson có subtitle không
    useEffect(() => {
        const checkSubtitle = async () => {
            if (!courseIsAiSupport || !lessonId) {
                setHasSubtitle(false);
                setIsChecking(false);
                return;
            }

            try {
                const data = await getLessonSubtitle(lessonId);
                setHasSubtitle(!!data?.subtitleText);
            } catch {
                // Nếu không có subtitle hoặc lỗi, không hiển thị icon
                setHasSubtitle(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkSubtitle();
    }, [lessonId, courseIsAiSupport]);

    // Không hiển thị nếu:
    // 1. Khóa học không hỗ trợ AI
    // 2. Đang kiểm tra subtitle
    // 3. Lesson chưa có subtitle
    if (!courseIsAiSupport || isChecking || !hasSubtitle) {
        return null;
    }

    return (
        <>
            <Button
                onClick={() => setIsEditorOpen(true)}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-50"
                title="Chỉnh sửa phụ đề"
            >
                <Subtitles className="w-4 h-4" />
            </Button>

            <SubtitleEditor
                lessonId={lessonId}
                lessonTitle={lessonTitle}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSuccess={() => {
                    setIsEditorOpen(false);
                    // Refresh để đảm bảo icon vẫn hiển thị sau khi cập nhật
                    const refreshCheck = async () => {
                        try {
                            const data = await getLessonSubtitle(lessonId);
                            setHasSubtitle(!!data?.subtitleText);
                        } catch {
                            setHasSubtitle(false);
                        }
                    };
                    refreshCheck();
                    if (onSubtitleUpdated) {
                        onSubtitleUpdated();
                    }
                }}
            />
        </>
    );
}

export default SubtitleManagementButton;

