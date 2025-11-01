import React, { useState, useEffect, useCallback } from "react";
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
  const userId = currentUser.id ?? currentUser.Id;
  const userName = currentUser.name ?? currentUser.userName ?? "Anonymous";
  const userAvatar =
    currentUser.avatarUrl ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`;

  // Fetch comments
  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // Fetch comments and organize them properly
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentApi.getByPost(postId);
      let allComments = res?.data?.data ?? [];

      console.log("Raw comments from API:", allComments);

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

      // Build comment tree structure - FIXED VERSION
      const commentMap = {};

      // First pass: create all comment objects
      allComments.forEach((comment) => {
        commentMap[comment.id] = {
          ...comment,
          commentPostId: comment.id,
          accountAvatarUrl:
            comment.accountAvatarUrl ||
            `https://api.dicebear.com/8.x/avataaars/svg?seed=${comment.accountName}`,
          likeCount: likeCounts[comment.id] ?? 0,
          replies: [],
        };
      });

      // Second pass: build tree structure
      // IMPORTANT: Process in order so parents exist before children
      const rootComments = [];

      allComments.forEach((comment) => {
        const commentObj = commentMap[comment.id];

        if (!comment.parentCommentId) {
          // This is a root comment
          rootComments.push(commentObj);
        } else {
          // This is a reply - find its parent
          const parent = commentMap[comment.parentCommentId];
          if (parent) {
            // Add to parent's replies array
            if (!parent.replies) {
              parent.replies = [];
            }
            parent.replies.push(commentObj);
          } else {
            // Orphaned comment (parent deleted?) - add as root
            console.warn(
              `Orphaned comment ${comment.id} - parent ${comment.parentCommentId} not found`
            );
            rootComments.push(commentObj);
          }
        }
      });

      // Sort root comments by date (newest first)
      rootComments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Sort nested replies by date (oldest first for conversation flow)
      const sortReplies = (comments) => {
        comments.forEach((comment) => {
          if (comment.replies && comment.replies.length > 0) {
            comment.replies.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            sortReplies(comment.replies);
          }
        });
      };
      sortReplies(rootComments);

      console.log("Organized comments tree:", rootComments);

      // Auto-expand comments that have replies
      const autoExpanded = {};
      const findCommentsWithReplies = (comments) => {
        comments.forEach((comment) => {
          if (comment.replies && comment.replies.length > 0) {
            autoExpanded[comment.id] = true;
            findCommentsWithReplies(comment.replies);
          }
        });
      };
      findCommentsWithReplies(rootComments);
      setExpandedReplies(autoExpanded);

      setComments(rootComments);
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

        // Update comment in state
        const updateCommentContent = (comments) => {
          return comments.map((c) => {
            if (c.id === editingId) {
              return { ...c, contents: commentText };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: updateCommentContent(c.replies),
              };
            }
            return c;
          });
        };

        setComments((prevComments) => updateCommentContent(prevComments));
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
        newComment.likeCount = newComment.likeCount ?? 0;
        newComment.replies = [];

        setComments((prevComments) => [newComment, ...prevComments]);
        toast.success("Bình luận thành công");
      }
      setCommentText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Separate handler for replies with independent text
  const handleSubmitReply = async (replyText, parentId) => {
    if (!replyText.trim()) {
      toast.warning("Vui lòng nhập bình luận");
      return;
    }
    if (!userId) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }

    try {
      console.log("Submitting reply to parentId:", parentId);

      const res = await commentApi.create({
        postId,
        contents: replyText,
        parentCommentId: parentId,
      });

      const newReply = res?.data?.data ?? {
        id: Date.now().toString(),
        postId,
        contents: replyText,
        accountId: userId,
        accountName: userName,
        accountAvatarUrl: userAvatar,
        likeCount: 0,
        parentCommentId: parentId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      newReply.commentPostId = newReply.id;
      newReply.accountAvatarUrl =
        newReply.accountAvatarUrl ||
        `https://api.dicebear.com/8.x/avataaars/svg?seed=${newReply.accountName}`;
      newReply.likeCount = newReply.likeCount ?? 0;
      newReply.replies = [];

      console.log("New reply created:", newReply);

      // Add reply to the correct parent comment (supports nested structure)
      const addReplyToComment = (comments) => {
        return comments.map((c) => {
          if (c.id === parentId) {
            console.log("Found parent, adding reply");
            return {
              ...c,
              replies: [...(c.replies ?? []), newReply],
            };
          }
          // Check in nested replies
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: addReplyToComment(c.replies),
            };
          }
          return c;
        });
      };

      setComments((prevComments) => addReplyToComment(prevComments));
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
      toast.success("Trả lời bình luận thành công");
      setReplyingToId(null);

      // Optionally refresh comments to ensure consistency with backend
      // Uncomment if nested replies still disappear:
      // setTimeout(() => fetchComments(), 1000);
    } catch (err) {
      console.error("Error submitting reply:", err);
      toast.error(err?.response?.data?.message || "Lỗi khi gửi trả lời");
      throw err; // Re-throw to handle in ReplyForm
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
      // Get comment info before deletion
      const deletedComment = findCommentById(comments, deleteCommentId);
      const deletedBy = deletedComment?.accountName || "Bạn";

      // Delete from server
      await commentApi.delete(deleteCommentId);

      // Update local state immediately
      const removeCommentById = (comments, idToRemove) => {
        return comments.reduce((acc, comment) => {
          if (comment.id === idToRemove) {
            // Skip this comment (delete it)
            return acc;
          }
          // Process replies recursively
          if (comment.replies && comment.replies.length > 0) {
            const filteredReplies = removeCommentById(
              comment.replies,
              idToRemove
            );
            return [...acc, { ...comment, replies: filteredReplies }];
          }
          return [...acc, comment];
        }, []);
      };

      setComments((prevComments) =>
        removeCommentById(prevComments, deleteCommentId)
      );

      // Show success notification with user info
      const notification = `${deletedBy} đã xóa bình luận thành công`;

      setDeletedCommentNotification(notification);
      toast.success("Xóa bình luận thành công");

      // Clear notification after 5 seconds
      setTimeout(() => {
        setDeletedCommentNotification("");
      }, 5000);

      setDeleteModalVisible(false);
      setDeleteCommentId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa bình luận");
    }
  };

  // Helper function to find comment by ID
  const findCommentById = (commentsList, commentId) => {
    for (const comment of commentsList) {
      if (comment.id === commentId) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, commentId);
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
      // Optimistic update
      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, (count) => count + 1)
      );

      const res = await commentApi.toggleLike(commentId);
      const actualCount = res?.data?.data?.totalLikes ?? 0;

      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, () => actualCount)
      );

      // Fetch fresh count
      const countRes = await commentApi.getLikeCount(commentId);
      const freshCount = countRes?.data?.data?.likeCount ?? actualCount;

      setComments((prevComments) =>
        updateCommentLike(prevComments, commentId, () => freshCount)
      );
    } catch (err) {
      // Revert on error
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
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: updateCommentLike(c.replies, commentId, updateFn),
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

  const renderComment = (comment, isReply = false, depth = 0) => {
    const isOwner = String(userId) === String(comment.accountId);
    const showReplies = expandedReplies[comment.id];

    // Optional: Limit depth for UI reasons (but allow deep nesting)
    const maxDepth = 20;
    const canReply = depth < maxDepth;

    return (
      <div key={comment.id}>
        <CommentItem
          comment={comment}
          isReply={isReply}
          isOwner={isOwner}
          showReplies={showReplies}
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
            comment.replies && comment.replies.length > 0 ? toggleReplies : null
          }
        >
          {/* Reply form with independent state */}
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
          {/* Nested replies - recursive rendering */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <>
              {comment.replies.map((reply) =>
                renderComment(reply, true, depth + 1)
              )}
            </>
          )}
        </CommentItem>
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

      {/* Deletion notification */}
      {deletedCommentNotification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{deletedCommentNotification}</p>
        </div>
      )}

      <Divider />

      {/* Main comment form */}
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

      {/* Comments list */}
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

      {/* Modals */}
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
