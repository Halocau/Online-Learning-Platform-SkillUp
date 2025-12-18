import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function AiTermsDialog({ open, onClose, onAccept }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                        <DialogTitle className="text-xl font-bold">
                            Điều khoản sử dụng AI hỗ trợ học viên
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-600 mt-2">
                        Vui lòng đọc kỹ các điều khoản trước khi kích hoạt tính năng AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            📋 Các tính năng AI sẽ được kích hoạt:
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                            <li>
                                <strong>Tạo phụ đề tự động:</strong> Hệ thống sẽ tự động tạo phụ đề cho
                                tất cả video bài học bằng công nghệ AI (Whisper + Gemini)
                            </li>
                            <li>
                                <strong>Chatbot tư vấn:</strong> Học viên có thể đặt câu hỏi về nội dung
                                bài học và nhận câu trả lời dựa trên phụ đề đã được tạo
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            ✅ Trách nhiệm và cam kết của bạn:
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p>
                                <strong>Bằng việc đồng ý kích hoạt tính năng AI, bạn xác nhận và chấp nhận:</strong>
                            </p>
                            <ul className="space-y-2 list-disc list-inside ml-2">
                                <li>
                                    Phụ đề sẽ được <strong>tạo tự động ngay sau khi bạn upload video</strong> và
                                    học viên có thể <strong>sử dụng ngay lập tức</strong> (bao gồm xem phụ đề và đặt câu hỏi với AI Chat).
                                </li>
                                <li>
                                    Phụ đề được tạo bởi AI <strong>có thể không hoàn toàn chính xác</strong>, đặc biệt
                                    với các thuật ngữ chuyên môn, tên riêng, hoặc nội dung kỹ thuật phức tạp.
                                </li>
                                <li>
                                    Bạn <strong>có quyền và trách nhiệm</strong> kiểm tra, chỉnh sửa phụ đề bất cứ lúc nào
                                    thông qua giao diện quản lý khóa học. Hệ thống sẽ tự động cập nhật nội dung AI Chat
                                    khi bạn chỉnh sửa.
                                </li>
                                <li>
                                    Bạn <strong>chịu trách nhiệm hoàn toàn</strong> về chất lượng và độ chính xác của nội dung
                                    phụ đề cuối cùng.
                                </li>
                                <li>
                                    Hệ thống <strong>không đảm bảo</strong> độ chính xác 100% của phụ đề tự động.
                                    Bất kỳ lỗi hoặc sai sót nào trong phụ đề là <strong>trách nhiệm của bạn </strong>
                                    với tư cách là người tạo nội dung.
                                </li>
                            </ul>
                            <p className="text-xs text-gray-600 italic mt-3 pt-3 border-t border-gray-300">
                                Lưu ý: Chúng tôi khuyến nghị bạn nên xem xét và chỉnh sửa phụ đề sau khi được tạo tự động
                                để đảm bảo chất lượng tốt nhất cho học viên.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                        onClick={onAccept}
                    >
                        Tôi đồng ý và kích hoạt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default AiTermsDialog;

