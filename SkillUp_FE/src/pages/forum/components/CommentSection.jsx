import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Avatar,
  Spin,
  Empty,
  Modal,
  Divider,
  Tooltip,
} from "antd";
import {
  Heart,
  Trash2,
  Edit2,
  MessageCircle,
  Send,
  Flag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import commentApi from "@/api/commentAPI";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser.id ?? currentUser.Id;
  const userName = currentUser.name ?? currentUser.userName ?? "Anonymous";
  const userAvatar =
    currentUser.avatarUrl ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`;

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // Fetch comments and organize them properly
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentApi.getByPost(postId);
      let allComments = res?.data?.data ?? [];

      console.log("📥 RAW COMMENTS FROM API:", allComments);

      // Fetch like counts for all comments
      const likeCounts = {};
      await Promise.all(
        allComments.map(async (c) => {
          try {
            const likeRes = await commentApi.getLikeCount(c.id);
            likeCounts[c.id] = likeRes?.data?.data?.likeCount ?? 0;
          } catch (err) {
            likeCounts[c.id] = 0;
          }
        })
      );

      console.log("❤️ LIKE COUNTS:", likeCounts);

      // Separate top-level comments and replies
      const topLevelComments = allComments.filter((c) => !c.parentCommentId);
      const replies = allComments.filter((c) => c.parentCommentId);

      // Map comments with proper fields
      const mappedComments = topLevelComments.map((c) => ({
        ...c,
        commentPostId: c.id,
        accountAvatarUrl:
          c.accountAvatarUrl ||
          `https://api.dicebear.com/8.x/avataaars/svg?seed=${c.accountName}`,
        likeCount: likeCounts[c.id] ?? 0,
        replies: replies
          .filter((r) => r.parentCommentId === c.id)
          .map((r) => ({
            ...r,
            commentPostId: r.id,
            accountAvatarUrl:
              r.accountAvatarUrl ||
              `https://api.dicebear.com/8.x/avataaars/svg?seed=${r.accountName}`,
            likeCount: likeCounts[r.id] ?? 0,
          })),
      }));

      console.log("✅ FINAL MAPPED COMMENTS:", mappedComments);
      setComments(mappedComments);
    } catch (err) {
      console.error("❌ Fetch comments error:", err);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.warning("Vui lòng nhập bình luận");
      return;
    }
    if (!userId) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await commentApi.update({
          commentId: editingId,
          contents: commentText,
        });
        setComments((prevComments) =>
          prevComments.map((c) => {
            if (c.id === editingId) return { ...c, contents: commentText };
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === editingId ? { ...r, contents: commentText } : r
                ),
              };
            }
            return c;
          })
        );
        toast.success("Cập nhật bình luận thành công");
        setEditingId(null);
      } else {
        const res = await commentApi.create({
          postId,
          contents: commentText,
          parentCommentId: replyingToId || null,
        });

        const newComment = res?.data?.data ?? {
          id: Date.now().toString(),
          postId,
          contents: commentText,
          accountId: userId,
          accountName: userName,
          accountAvatarUrl: userAvatar,
          likeCount: 0,
          parentCommentId: replyingToId || null,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        newComment.commentPostId = newComment.id;
        newComment.accountAvatarUrl =
          newComment.accountAvatarUrl ||
          `https://api.dicebear.com/8.x/avataaars/svg?seed=${newComment.accountName}`;
        newComment.likeCount = newComment.likeCount ?? 0;

        if (replyingToId) {
          console.log("📝 ADDING REPLY TO:", replyingToId);
          setComments((prevComments) =>
            prevComments.map((c) => {
              if (c.id === replyingToId) {
                return {
                  ...c,
                  replies: [...(c.replies ?? []), newComment],
                };
              }
              return c;
            })
          );
          setExpandedReplies((prev) => ({ ...prev, [replyingToId]: true }));
          toast.success("Trả lời bình luận thành công");
          setReplyingToId(null);
        } else {
          console.log("📝 ADDING TOP-LEVEL COMMENT");
          newComment.replies = [];
          setComments((prevComments) => [newComment, ...prevComments]);
          toast.success("Bình luận thành công");
        }
      }
      setCommentText("");
    } catch (err) {
      console.error("❌ Submit comment error:", err);
      toast.error(err?.response?.data?.message || "Lỗi khi gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setCommentText(comment.contents);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCommentText("");
    setReplyingToId(null);
  };

  const handleDeleteComment = async () => {
    try {
      await commentApi.delete(deleteCommentId);
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== deleteCommentId)
      );
      toast.success("Xóa bình luận thành công");
      setDeleteModalVisible(false);
      setDeleteCommentId(null);
    } catch (err) {
      console.error("❌ Delete comment error:", err);
      toast.error(err?.response?.data?.message || "Lỗi khi xóa bình luận");
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!userId) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }

    try {
      // Optimistically update
      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, (count) => count + 1)
      );

      // Toggle like on backend
      const res = await commentApi.toggleLike(commentId);
      console.log("❤️ TOGGLE RESPONSE:", res.data);

      // Get actual count from backend
      const actualCount = res?.data?.data?.totalLikes ?? 0;

      // Update with actual count
      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, () => actualCount)
      );

      // Also fetch fresh count to be sure
      const countRes = await commentApi.getLikeCount(commentId);
      const freshCount = countRes?.data?.data?.likeCount ?? actualCount;

      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, () => freshCount)
      );
    } catch (err) {
      console.error("❌ Toggle like error:", err);
      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, (count) =>
          Math.max(0, count - 1)
        )
      );
    }
  };

  const updateCommentLike = (prevComments, commentId, updateFn) => {
    return prevComments.map((c) => {
      if (c.id === commentId) {
        return { ...c, likeCount: updateFn(c.likeCount ?? 0) };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId
              ? { ...r, likeCount: updateFn(r.likeCount ?? 0) }
              : r
          ),
        };
      }
      return c;
    });
  };

  const handleReportComment = async () => {
    if (!reportReason.trim()) {
      toast.warning("Vui lòng nhập lý do");
      return;
    }
    try {
      await commentApi.report({
        commentPostId: reportCommentId,
        reason: reportReason,
      });
      toast.success("Báo cáo bình luận thành công");
      setReportModalVisible(false);
      setReportCommentId(null);
      setReportReason("");
    } catch (err) {
      console.error("❌ Report comment error:", err);
      toast.error(err?.response?.data?.message || "Lỗi khi báo cáo");
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderComment = (comment, isReply = false) => {
    const isOwner = String(userId) === String(comment.accountId);
    const commentId = comment.id;
    const likeCount = comment.likeCount ?? 0;
    const replies = comment.replies ?? [];
    const showReplies = expandedReplies[commentId];

    return (
      <div
        key={commentId}
        className={`flex gap-4 pb-4 ${
          !isReply ? "border-b border-gray-100" : ""
        }`}
      >
        <Avatar
          src={comment.accountAvatarUrl}
          size={isReply ? 32 : 40}
          className="flex-shrink-0 border border-gray-200"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">
                {comment.accountName}
              </h4>
              <p className="text-xs text-gray-500">
                {dayjs(comment.createdAt).fromNow()}
              </p>
            </div>
            {isOwner && (
              <div className="flex gap-1 flex-shrink-0">
                <Tooltip title="Sửa">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </Tooltip>
                <Tooltip title="Xóa">
                  <button
                    onClick={() => {
                      setDeleteCommentId(commentId);
                      setDeleteModalVisible(true);
                    }}
                    className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </Tooltip>
              </div>
            )}
            {!isOwner && (
              <Tooltip title="Báo cáo">
                <button
                  onClick={() => {
                    setReportCommentId(commentId);
                    setReportModalVisible(true);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Flag size={14} />
                </button>
              </Tooltip>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap break-words">
            {comment.contents}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => handleToggleLike(commentId)}
              className="flex items-center gap-1 text-gray-500 hover:text-pink-600 font-medium transition-colors"
            >
              <Heart size={14} />
              <span>{likeCount}</span>
            </button>
            {!isReply && (
              <button
                onClick={() =>
                  setReplyingToId(replyingToId === commentId ? null : commentId)
                }
                className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <MessageCircle size={14} />
                <span>Trả lời</span>
              </button>
            )}
          </div>

          {replyingToId === commentId && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-2">
                <Avatar src={userAvatar} size={32} className="flex-shrink-0" />
                <div className="flex-1">
                  <Input.TextArea
                    placeholder="Viết trả lời..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    className="rounded resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="small"
                      onClick={() => {
                        setReplyingToId(null);
                        setCommentText("");
                      }}
                      className="rounded"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleSubmitComment}
                      loading={submitting}
                      className="rounded bg-indigo-600 border-0"
                    >
                      Trả lời
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {replies.length > 0 && !isReply && (
            <div className="mt-3">
              <button
                onClick={() => toggleReplies(commentId)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUp size={14} />
                    Ẩn {replies.length} trả lời
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Hiển thị {replies.length} trả lời
                  </>
                )}
              </button>

              {showReplies && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                  {replies.map((reply) => renderComment(reply, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle size={24} className="text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Bình luận ({comments.length})
          </h2>
        </div>
        <Button
          size="small"
          onClick={fetchComments}
          icon={<RefreshCw size={14} />}
          className="rounded"
        >
          Tải lại
        </Button>
      </div>

      <Divider />

      <div className="mb-8">
        <div className="flex gap-3 items-start">
          <Avatar
            src={userAvatar}
            size={40}
            className="flex-shrink-0 border border-gray-200"
          />
          <div className="flex-1 w-full">
            <Input.TextArea
              placeholder={userId ? "Chia sẻ ý kiến..." : "Vui lòng đăng nhập"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!userId || submitting}
              rows={editingId || replyingToId ? 4 : 3}
              maxLength={1000}
              className="rounded-lg resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                {commentText.length}/1000 ký tự
              </span>
              <div className="flex gap-2">
                {(editingId || replyingToId) && (
                  <Button onClick={handleCancelEdit} className="rounded-lg">
                    Hủy
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={handleSubmitComment}
                  loading={submitting}
                  disabled={!userId || !commentText.trim()}
                  icon={<Send size={14} />}
                  className="rounded-lg bg-indigo-600 border-0"
                >
                  {editingId ? "Cập nhật" : replyingToId ? "Trả lời" : "Gửi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin />
          </div>
        ) : comments.length === 0 ? (
          <Empty description="Chưa có bình luận nào" />
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      <Modal
        title="Xóa bình luận"
        open={deleteModalVisible}
        onOk={handleDeleteComment}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn chắc chắn muốn xóa bình luận này không?</p>
      </Modal>

      <Modal
        title="Báo cáo bình luận"
        open={reportModalVisible}
        onOk={handleReportComment}
        onCancel={() => {
          setReportModalVisible(false);
          setReportReason("");
        }}
        okText="Báo cáo"
        cancelText="Hủy"
        centered
      >
        <div className="space-y-4">
          <p>Lý do báo cáo:</p>
          <Input.TextArea
            placeholder="Nhập lý do..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            maxLength={500}
            className="rounded"
          />
          <p className="text-xs text-gray-400">
            {reportReason.length}/500 ký tự
          </p>
        </div>
      </Modal>
    </div>
  );
}
