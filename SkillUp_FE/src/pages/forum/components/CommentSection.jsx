import React, { useState, useEffect } from "react";
import { Spin, Empty, Divider, Button } from "antd";
import { MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import CommentModals from "./CommentModal";
import commentApi from "@/api/commentAPI";
import ReplyForm from "./ReplyForm";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [deletedCommentNotification, setDeletedCommentNotification] =
    useState("");

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState("");

  // User info
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser.userId ?? currentUser.Id;
  const userName = currentUser.name ?? currentUser.userName ?? "Anonymous";
  const userAvatar =
    currentUser.avatarUrl ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`;

  // Fetch comments
  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentApi.getByPost(postId);
      const allComments = res?.data?.data ?? [];

      const commentMap = {};
      const rootComments = [];
      const seenIds = new Set();

      // 1. First pass: Create a map of all comments and initialize replies
      allComments.forEach((comment) => {
        if (!comment.id || seenIds.has(comment.id)) {
          console.warn("Duplicate or invalid comment ID:", comment.id);
          return;
        }
        seenIds.add(comment.id);

        commentMap[comment.id] = {
          ...comment,
          commentPostId: comment.id,
          accountAvatarUrl:
            comment.accountAvatarUrl ||
            `https://api.dicebear.com/8.x/avataaars/svg?seed=${comment.accountName}`,
          likeCount: comment.likeCount ?? 0,
          replies: [],
        };
      });

      // 2. Second pass: Build the tree structure
      Object.values(commentMap).forEach((comment) => {
        if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
          // This is a reply, add it to its parent
          commentMap[comment.parentCommentId].replies.push(comment);
        } else {
          // This is a root comment (or an orphan reply)
          rootComments.push(comment);
        }
      });

      // Sort root comments (newest first)
      rootComments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Sort all replies (oldest first, for chronological order)
      const sortReplies = (comments) => {
        comments.forEach((c) => {
          if (c.replies?.length) {
            c.replies.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            sortReplies(c.replies);
          }
        });
      };
      sortReplies(rootComments);

      setComments(rootComments);

      // Auto-expand parents with replies
      setExpandedReplies((prev) => {
        const expanded = { ...prev };
        const mark = (comments) => {
          comments.forEach((c) => {
            if (c.replies?.length > 0) {
              expanded[c.id] = true;
              mark(c.replies);
            }
          });
        };
        mark(rootComments);
        return expanded;
      });
    } catch (err) {
      console.error("Error fetching comments:", err);
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

        const updateCommentInTree = (commentsList) => {
          return commentsList.map((c) => {
            if (c.id === editingId) {
              return { ...c, contents: commentText };
            }
            if (c.replies?.length > 0) {
              return { ...c, replies: updateCommentInTree(c.replies) };
            }
            return c;
          });
        };

        setComments((prev) => updateCommentInTree(prev));

        toast.success("Cập nhật bình luận thành công");
        setEditingId(null);
      } else {
        const res = await commentApi.create({
          postId,
          contents: commentText,
          parentCommentId: null,
        });

        const newComment = res?.data?.data ?? {
          id: Date.now().toString(),
          postId,
          contents: commentText,
          accountId: userId,
          accountName: userName,
          accountAvatarUrl: userAvatar,
          likeCount: 0,
          parentCommentId: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        newComment.commentPostId = newComment.id;
        newComment.accountAvatarUrl =
          newComment.accountAvatarUrl ||
          `https://api.dicebear.com/8.x/avataaars/svg?seed=${newComment.accountName}`;
        newComment.likeCount = 0;
        newComment.replies = [];

        setComments((prev) => [newComment, ...prev]);
        toast.success("Bình luận thành công");
      }
      setCommentText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (replyText, parentId) => {
    if (!replyText.trim() || !userId) return;

    try {
      const res = await commentApi.create({
        postId,
        contents: replyText,
        parentCommentId: parentId,
      });

      const newReply = res?.data?.data;
      if (!newReply) throw new Error("No reply data");

      const normalizedReply = {
        ...newReply,
        commentPostId: newReply.id,
        accountAvatarUrl:
          newReply.accountAvatarUrl ||
          `https://api.dicebear.com/8.x/avataaars/svg?seed=${newReply.accountName}`,
        likeCount: newReply.likeCount ?? 0,
        replies: [],
      };

      setComments((prevComments) => {
        const addReply = (comments) => {
          return comments.map((c) => {
            if (c.id === parentId) {
              if (c.replies.some((r) => r.id === normalizedReply.id)) return c;
              return { ...c, replies: [...c.replies, normalizedReply] };
            }
            if (c.replies?.length > 0) {
              return { ...c, replies: addReply(c.replies) };
            }
            return c;
          });
        };
        return addReply(prevComments);
      });

      toast.success("Trả lời thành công");
      setReplyingToId(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi gửi trả lời");
    }
  };

  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setCommentText(comment.contents);
    setReplyingToId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCommentText("");
    setReplyingToId(null);
  };

  const handleDeleteComment = async () => {
    try {
      const deletedComment = findCommentById(comments, deleteCommentId);
      const deletedBy = deletedComment?.accountName || "Bạn";

      await commentApi.delete(deleteCommentId);

      const removeCommentById = (comments, idToRemove) => {
        return comments.reduce((acc, c) => {
          if (c.id === idToRemove) return acc;
          if (c.replies?.length > 0) {
            return [
              ...acc,
              { ...c, replies: removeCommentById(c.replies, idToRemove) },
            ];
          }
          return [...acc, c];
        }, []);
      };

      setComments((prev) => removeCommentById(prev, deleteCommentId));

      setDeletedCommentNotification(`${deletedBy} đã xóa bình luận thành công`);
      toast.success("Xóa bình luận thành công");
      setTimeout(() => setDeletedCommentNotification(""), 5000);

      setDeleteModalVisible(false);
      setDeleteCommentId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa bình luận");
    }
  };

  const findCommentById = (list, id) => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies?.length > 0) {
        const found = findCommentById(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleToggleLike = async (commentId) => {
    if (!userId) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }

    try {
      setComments((prev) => updateLike(prev, commentId, (c) => c + 1));
      const res = await commentApi.toggleLike(commentId);
      const actual = res?.data?.data?.totalLikes ?? 0;
      setComments((prev) => updateLike(prev, commentId, () => actual));

      const countRes = await commentApi.getLikeCount(commentId);
      const fresh = countRes?.data?.data?.likeCount ?? actual;
      setComments((prev) => updateLike(prev, commentId, () => fresh));
    } catch (err) {
      setComments((prev) =>
        updateLike(prev, commentId, (c) => Math.max(0, c - 1))
      );
    }
  };

  const updateLike = (comments, id, fn) => {
    return comments.map((c) => {
      if (c.id === id) return { ...c, likeCount: fn(c.likeCount ?? 0) };
      if (c.replies?.length > 0)
        return { ...c, replies: updateLike(c.replies, id, fn) };
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
      toast.success("Báo cáo thành công");
      setReportModalVisible(false);
      setReportCommentId(null);
      setReportReason("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi báo cáo");
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReply = (commentId) => {
    setReplyingToId(replyingToId === commentId ? null : commentId);
    setEditingId(null);
  };

  const renderComment = (
    comment,
    isReply = false,
    depth = 0,
    parentId = null
  ) => {
    const isOwner = String(userId) === String(comment.accountId);
    const showReplies = expandedReplies[comment.id];
    const maxDepth = 20;
    const canReply = depth < maxDepth;

    const uniqueKey = `${comment.id}-${parentId || "root"}-${depth}`;

    return (
      <div key={uniqueKey}>
        <CommentItem
          comment={comment}
          isReply={isReply}
          isOwner={isOwner}
          showReplies={false}
          replyingToId={replyingToId}
          onEdit={handleEditComment}
          onDelete={(id) => {
            setDeleteCommentId(id);
            setDeleteModalVisible(true);
          }}
          onReport={(id) => {
            setReportCommentId(id);
            setReportModalVisible(true);
          }}
          onToggleLike={handleToggleLike}
          onReply={canReply ? handleReply : null}
          onToggleReplies={
            comment.replies?.length > 0 ? () => toggleReplies(comment.id) : null
          }
        >
          {replyingToId === comment.id && canReply && (
            <ReplyForm
              userAvatar={userAvatar}
              userId={userId}
              onSubmit={handleSubmitReply}
              onCancel={() => setReplyingToId(null)}
              submitting={submitting}
              parentCommentId={comment.id}
            />
          )}
        </CommentItem>

        {showReplies && comment.replies?.length > 0 && (
          <div className="ml-12 mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
            {comment.replies.map((reply) =>
              renderComment(reply, true, depth + 1, comment.id)
            )}
          </div>
        )}
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

      {deletedCommentNotification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{deletedCommentNotification}</p>
        </div>
      )}

      <Divider />

      <CommentForm
        userAvatar={userAvatar}
        userId={userId}
        commentText={commentText}
        setCommentText={setCommentText}
        submitting={submitting}
        editingId={editingId}
        replyingToId={replyingToId}
        onSubmit={handleSubmitComment}
        onCancel={handleCancelEdit}
      />

      <Divider />

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin />
          </div>
        ) : comments.length === 0 ? (
          <Empty description="Chưa có bình luận nào" />
        ) : (
          comments.map((comment) => renderComment(comment, false, 0))
        )}
      </div>

      <CommentModals
        deleteModalVisible={deleteModalVisible}
        setDeleteModalVisible={setDeleteModalVisible}
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        reportReason={reportReason}
        setReportReason={setReportReason}
        onDeleteConfirm={handleDeleteComment}
        onReportConfirm={handleReportComment}
      />
    </div>
  );
}
