import { useState } from "react";
import { SendHorizonal, Sparkles, Loader2 } from "lucide-react";
import { lessonChatAPI } from "@/api/lessonChatAPI";
import { toast } from "react-toastify";

const LessonChat = ({ lessonId }) => {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userMessage = { role: "user", content: question.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);
        try {
            const response = await lessonChatAPI.askLesson(lessonId, userMessage.content);
            const chatPayload = response.data?.data?.[0];
            const answerText =
                chatPayload?.message ??
                "Xin lỗi, mình chưa có đủ thông tin để trả lời. Vui lòng thử lại sau.";
            const assistantMessage = {
                role: "assistant",
                content: answerText,
                sources: chatPayload?.sources ?? [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Không thể gửi câu hỏi. Vui lòng thử lại.";
            toast.error(message);
            setMessages((prev) => prev.slice(0, -1)); // remove user message for failed request
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                    <p className="text-base font-semibold text-gray-900">
                        Trợ lý AI cho bài học này
                    </p>
                    <p className="text-sm text-gray-500">
                        Đặt câu hỏi dựa trên nội dung video và phụ đề tương ứng.
                    </p>
                </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {messages.length === 0 && (
                    <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                        Chưa có câu hỏi nào. Hãy bắt đầu bằng cách hỏi điều bạn thắc mắc
                        trong bài học này.
                    </div>
                )}
                {messages.map((message, idx) => (
                    <div
                        key={idx}
                        className={`rounded-lg p-3 text-sm shadow-sm ${message.role === "user"
                            ? "bg-yellow-50 border border-yellow-100 text-gray-800"
                            : "bg-gray-50 border border-gray-100 text-gray-900"
                            }`}
                    >
                        <p className="font-semibold mb-1">
                            {message.role === "user" ? "Bạn" : "Trợ lý"}
                        </p>
                        <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
                        
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-3">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Video này nói về khái niệm nào?"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang trả lời...
                            </>
                        ) : (
                            <>
                                <SendHorizonal className="w-4 h-4" />
                                Gửi câu hỏi
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LessonChat;

