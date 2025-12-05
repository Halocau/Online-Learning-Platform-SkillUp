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
import { motion, AnimatePresence } from "framer-motion";

const CommentSection = ({ lessonId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedComments, setLikedComments] = useState(new Set());

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

    if (diffInSeconds < 60) return "vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm trước`;
  };

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

  const handleLike = async (id) => {
    // Find current like count before update
    let currentLikeCount = 0;
    const findComment = (comments, targetId) => {
      for (const c of comments) {
        if (c.id === targetId) return c;
        if (c.replies?.length > 0) {
          const found = c.replies.find(r => r.id === targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const comment = findComment(comments, id);
    if (comment) {
      currentLikeCount = comment.likeCount || 0;
    }

    const wasLiked = likedComments.has(id);
    
    // Optimistic update for liked state
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    // Calculate new count based on current state
    const newCount = wasLiked ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1;

    // Update comment counts optimistically
    setComments(prevComments => 
      prevComments.map(c => {
        if (c.id === id) {
          return { ...c, likeCount: newCount };
        }
        if (c.replies?.length > 0) {
          return {
            ...c,
            replies: c.replies.map(r => 
              r.id === id 
                ? { ...r, likeCount: newCount }
                : r
            )
          };
        }
        return c;
      })
    );

    try {
      await commentLessonApi.toggleLike(id);
      // Don't reload - keep optimistic update
    } catch (err) {
      console.error("Error toggling like:", err);
      // Rollback on error
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      
      // Rollback count
      setComments(prevComments => 
        prevComments.map(c => {
          if (c.id === id) {
            return { ...c, likeCount: currentLikeCount };
          }
          if (c.replies?.length > 0) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === id 
                  ? { ...r, likeCount: currentLikeCount }
                  : r
              )
            };
          }
          return c;
        })
      );
    }
  };

  const openDeleteModal = (id) => {
    setCommentToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (commentToDelete) {
      await commentLessonApi.delete(commentToDelete);
      await loadComments();
      setDeleteModalVisible(false);
      setCommentToDelete(null);
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.contents);
  };

  const handleSaveEdit = async () => {
    await commentLessonApi.update({
      commentId: editingId,
      contents: editText,
    });
    setEditingId(null);
    setEditText("");
    await loadComments();
  };

  const openReportModal = (id) => {
    setCommentToReport(id);
    setReportModalVisible(true);
  };

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

  const isOwner = (comment) => {
    return currentUserId && comment.accountId === currentUserId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div ref={commentsTopRef} className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Thảo luận ({comments.length})
        </h2>
      </div>

      <div className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn..."
          className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            Đăng
          </motion.button>
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                      className="w-full border mt-2 p-2 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{c.contents}</p>
                  )}

                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(c.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedComments.has(c.id)
                          ? "text-yellow-500"
                          : "hover:text-yellow-500"
                      }`}
                    >
                      <motion.div
                        animate={
                          likedComments.has(c.id) ? { scale: [1, 1.3, 1] } : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <ThumbsUp
                          size={16}
                          fill={likedComments.has(c.id) ? "currentColor" : "none"}
                        />
                      </motion.div>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={c.likeCount}
                          initial={{ scale: 1.3, color: "#eab308" }}
                          animate={{ scale: 1, color: likedComments.has(c.id) ? "#eab308" : undefined }}
                          transition={{ duration: 0.2 }}
                        >
                          {c.likeCount}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setReplyingTo(c.id);
                        setEditingId(null);
                      }}
                      className="flex items-center gap-1 hover:text-yellow-500 transition-colors"
                    >
                      <Reply size={16} /> Trả lời
                    </motion.button>

                    {isOwner(c) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startEditing(c)}
                        className="flex items-center gap-1 hover:text-green-600 transition-colors"
                      >
                        <Edit size={16} /> Sửa
                      </motion.button>
                    )}

                    {isOwner(c) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(c.id)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} /> Xóa
                      </motion.button>
                    )}

                    {!isOwner(c) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openReportModal(c.id)}
                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                      >
                        <Flag size={16} /> Báo cáo
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {editingId === c.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex gap-2"
                      >
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                        >
                          Hủy
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {replyingTo === c.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex gap-2"
                      >
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 border rounded p-2 focus:ring-2 focus:ring-yellow-400"
                          placeholder={`Trả lời ${c.accountName}...`}
                        />
                        <button
                          onClick={() => handleAddReply(c.id)}
                          className="px-4 py-2 bg-yellow-400 rounded hover:bg-yellow-300 transition-colors"
                        >
                          Gửi
                        </button>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                        >
                          Hủy
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {c.replies?.length > 0 && (
                    <div className="mt-4 pl-6 border-l space-y-3">
                      <AnimatePresence>
                        {c.replies.map((r) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
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
                                className="w-full border mt-2 p-2 rounded focus:ring-2 focus:ring-yellow-400"
                              />
                            ) : (
                              <p className="text-gray-700 mt-1">{r.contents}</p>
                            )}

                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLike(r.id)}
                                className={`flex items-center gap-1 transition-colors ${
                                  likedComments.has(r.id)
                                    ? "text-yellow-500"
                                    : "hover:text-yellow-500"
                                }`}
                              >
                                <motion.div
                                  animate={
                                    likedComments.has(r.id) ? { scale: [1, 1.3, 1] } : {}
                                  }
                                  transition={{ duration: 0.3 }}
                                >
                                  <ThumbsUp
                                    size={14}
                                    fill={likedComments.has(r.id) ? "currentColor" : "none"}
                                  />
                                </motion.div>
                                <AnimatePresence mode="wait">
                                  <motion.span
                                    key={r.likeCount}
                                    initial={{ scale: 1.3, color: "#eab308" }}
                                    animate={{ scale: 1, color: likedComments.has(r.id) ? "#eab308" : undefined }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {r.likeCount}
                                  </motion.span>
                                </AnimatePresence>
                              </motion.button>

                              {isOwner(r) && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => startEditing(r)}
                                  className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                >
                                  <Edit size={14} /> Sửa
                                </motion.button>
                              )}

                              {isOwner(r) && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openDeleteModal(r.id)}
                                  className="flex items-center gap-1 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={14} /> Xóa
                                </motion.button>
                              )}

                              {!isOwner(r) && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openReportModal(r.id)}
                                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                                >
                                  <Flag size={14} /> Báo cáo
                                </motion.button>
                              )}
                            </div>

                            <AnimatePresence>
                              {editingId === r.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 flex gap-2"
                                >
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400 transition-colors"
                                  >
                                    Hủy
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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