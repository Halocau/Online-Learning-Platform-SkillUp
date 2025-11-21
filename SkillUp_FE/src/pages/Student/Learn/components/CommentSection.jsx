import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Reply,
  Edit,
  Trash2,
  Flag,
} from "lucide-react";
import { commentLessonApi } from "@/api/commentLesson";
import { jwtDecode } from "jwt-decode";
import CommentModals from "@/pages/forum/components/CommentModal";

const CommentSection = ({ lessonId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentToReport, setCommentToReport] = useState(null);

  const commentsTopRef = useRef(null);

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return "vừa xong";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} tuần trước`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} tháng trước`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm trước`;
  };

  // Get current user ID from JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [lessonId]);

  const loadComments = async () => {
    const data = await commentLessonApi.getByLesson(lessonId);

    const roots = data.filter((c) => !c.parentCommentId);
    const replies = data.filter((c) => c.parentCommentId);

    const sortedRoots = roots.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const grouped = sortedRoots.map((c) => ({
      ...c,
      replies: replies
        .filter((r) => r.parentCommentId === c.id)

        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));

    setComments(grouped);
  };

  // Create main comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await commentLessonApi.create({
      lessonId,
      contents: newComment,
      parentCommentId: null,
    });

    setNewComment("");
    await loadComments();

    commentsTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Create reply
  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    await commentLessonApi.create({
      lessonId,
      contents: replyText,
      parentCommentId: parentId,
    });

    setReplyText("");
    setReplyingTo(null);
    await loadComments();
  };

  // Toggle like
  const handleLike = async (id) => {
    await commentLessonApi.toggleLike(id);
    await loadComments();
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setCommentToDelete(id);
    setDeleteModalVisible(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (commentToDelete) {
      await commentLessonApi.delete(commentToDelete);
      await loadComments();
      setDeleteModalVisible(false);
      setCommentToDelete(null);
    }
  };

  // Start editing
  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.contents);
  };

  // Save edit
  const handleSaveEdit = async () => {
    await commentLessonApi.update({
      commentId: editingId,
      contents: editText,
    });

    setEditingId(null);
    setEditText("");
    await loadComments();
  };

  // Open report modal
  const openReportModal = (id) => {
    setCommentToReport(id);
    setReportModalVisible(true);
  };

  // Confirm report
  const handleReportConfirm = async () => {
    if (commentToReport && reportReason.trim()) {
      await commentLessonApi.report({
        commentLessonId: commentToReport,
        reason: reportReason,
      });
      setReportModalVisible(false);
      setCommentToReport(null);
      setReportReason("");
    }
  };

  // Check if current user is the comment creator
  const isOwner = (comment) => {
    return currentUserId && comment.accountId === currentUserId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* HEADER */}
      <div ref={commentsTopRef} className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Thảo luận ({comments.length})
        </h2>
      </div>

      {/* ADD COMMENT */}
      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn..."
          className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-yellow-400"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Đăng
          </button>
        </div>
      </div>

      {/* LIST COMMENTS */}
      <div className="space-y-8">
        {comments.map((c) => (
          <div key={c.id}>
            {/* Main comment */}
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.accountName}</div>
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(c.createdAt)}
                  </span>
                </div>

                {editingId === c.id ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border mt-2 p-2 rounded"
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{c.contents}</p>
                )}

                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  <button
                    onClick={() => handleLike(c.id)}
                    className="flex items-center gap-1 hover:text-yellow-500"
                  >
                    <ThumbsUp size={16} />
                    {c.likeCount}
                  </button>

                  <button
                    onClick={() => {
                      setReplyingTo(c.id);
                      setEditingId(null);
                    }}
                    className="flex items-center gap-1 hover:text-yellow-500"
                  >
                    <Reply size={16} /> Trả lời
                  </button>

                  {isOwner(c) && (
                    <button
                      onClick={() => startEditing(c)}
                      className="flex items-center gap-1 hover:text-green-600"
                    >
                      <Edit size={16} /> Sửa
                    </button>
                  )}

                  {isOwner(c) && (
                    <button
                      onClick={() => openDeleteModal(c.id)}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  )}

                  {!isOwner(c) && (
                    <button
                      onClick={() => openReportModal(c.id)}
                      className="flex items-center gap-1 hover:text-red-400"
                    >
                      <Flag size={16} /> Báo cáo
                    </button>
                  )}
                </div>

                {editingId === c.id && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                )}

                {replyingTo === c.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 border rounded p-2"
                      placeholder={`Trả lời ${c.accountName}...`}
                    />
                    <button
                      onClick={() => handleAddReply(c.id)}
                      className="px-4 py-2 bg-yellow-400 rounded hover:bg-yellow-300"
                    >
                      Gửi
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                )}

                {c.replies?.length > 0 && (
                  <div className="mt-4 pl-6 border-l space-y-3">
                    {c.replies.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-3 rounded border border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">
                            {r.accountName}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              · trả lời {c.accountName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(r.createdAt)}
                          </span>
                        </div>

                        {editingId === r.id ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border mt-2 p-2 rounded"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">{r.contents}</p>
                        )}

                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                          <button
                            onClick={() => handleLike(r.id)}
                            className="flex items-center gap-1 hover:text-yellow-500"
                          >
                            <ThumbsUp size={14} /> {r.likeCount}
                          </button>

                          {isOwner(r) && (
                            <button
                              onClick={() => startEditing(r)}
                              className="flex items-center gap-1 hover:text-green-600"
                            >
                              <Edit size={14} /> Sửa
                            </button>
                          )}

                          {isOwner(r) && (
                            <button
                              onClick={() => openDeleteModal(r.id)}
                              className="flex items-center gap-1 hover:text-red-600"
                            >
                              <Trash2 size={14} /> Xóa
                            </button>
                          )}

                          {/* REPORT - Only for non-owners */}
                          {!isOwner(r) && (
                            <button
                              onClick={() => openReportModal(r.id)}
                              className="flex items-center gap-1 hover:text-red-400"
                            >
                              <Flag size={14} /> Báo cáo
                            </button>
                          )}
                        </div>

                        {/* SAVE EDIT for reply */}
                        {editingId === r.id && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CommentModals
        deleteModalVisible={deleteModalVisible}
        setDeleteModalVisible={setDeleteModalVisible}
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        reportReason={reportReason}
        setReportReason={setReportReason}
        onDeleteConfirm={handleDeleteConfirm}
        onReportConfirm={handleReportConfirm}
      />
    </div>
  );
};

export default CommentSection;
