import { useState } from "react";
import {
  MessageCircle,
  Send,
  ThumbsUp,
  Reply,
} from "lucide-react";

const CommentSection = ({ courseId, itemId }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      userId: "user-1",
      userName: "Nguyễn Văn A",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      content:
        "Giải thích rất hay! Video này đã giúp tôi hiểu khái niệm tốt hơn nhiều.",
      timestamp: "2 giờ trước",
      likes: 5,
      replies: [
        {
          id: 2,
          userId: "user-2",
          userName: "Trần Thị B",
          userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          content: "Tôi cũng đồng ý! Rất rõ ràng và súc tích.",
          timestamp: "1 giờ trước",
          likes: 2,
        },
      ],
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      userId: "current-user",
      userName: "Bạn",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      content: newComment,
      timestamp: "Vừa xong",
      likes: 0,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      userId: "current-user",
      userName: "Bạn",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      content: replyText,
      timestamp: "Vừa xong",
      likes: 0,
    };

    setComments(
      comments.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )
    );

    setReplyText("");
    setReplyingTo(null);
  };

  const handleLike = async (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Thảo luận ({comments.length})
        </h2>
      </div>

      {/* Add Comment */}
      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Chia sẻ suy nghĩ hoặc đặt câu hỏi..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Đăng
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Chưa có bình luận. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              {/* Main Comment */}
              <div className="flex gap-3">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {comment.userName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-2 ml-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#FFD54F] transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#FFD54F] transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      Trả lời
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Trả lời ${comment.userName}...`}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 text-sm bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-40"
                      >
                        Gửi
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 ml-6">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <img
                            src={reply.userAvatar}
                            alt={reply.userName}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-xs text-gray-900">
                                  {reply.userName}
                                </h5>
                                <span className="text-xs text-gray-500">
                                  {reply.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {reply.content}
                              </p>
                            </div>
                            <button
                              onClick={() => handleLike(reply.id)}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#FFD54F] transition-colors mt-1 ml-2"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {comments.length > 3 && (
        <button className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Tải thêm bình luận
        </button>
      )}
    </div>
  );
};

export default CommentSection;