// Đường dẫn: src/pages/forum/components/CommentSection.jsx
// (Hãy copy và dán toàn bộ code này để thay thế file cũ)

import React, { useState, useEffect, useCallback } from "react";
import { Spin, Empty, Divider, Button } from "antd";
import { MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import CommentItem from "./CommentItem.jsx";
import CommentForm from "./CommentForm.jsx";
import CommentModals from "./CommentModal.jsx";
import commentApi from "@/api/commentAPI";
import ReplyForm from "./ReplyForm.jsx";
import signalRService from "./SignalRService.jsx";

// --- Chuyển hàm helper ra ngoài để dùng chung ---
const findCommentById = (list, id) => {
  if (!list || !Array.isArray(list)) return null;
  for (const c of list) {
    if (c.id === id) return c;
    if (c.replies?.length > 0) {
      const found = findCommentById(c.replies, id);
      if (found) return found;
    }
  }
  return null;
};

// Hàm chuẩn hóa comment (từ API hoặc SignalR)
const normalizeComment = (comment) => ({
  ...comment,
  commentPostId: comment.id,
  accountAvatarUrl:
    comment.accountAvatarUrl ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${comment.accountName}`,
  likeCount: comment.likeCount ?? 0,
  replies: comment.replies || [],
});

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
  const [likedComments, setLikedComments] = useState(new Set());

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

  // --- 1. useEffect để fetch comment LẦN ĐẦU ---
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await commentApi.getByPost(postId);
      const allComments = res?.data?.data ?? [];

      const commentMap = {};
      const rootComments = [];
      const seenIds = new Set();
      const newExpanded = {};

      allComments.forEach((comment) => {
        if (!comment.id || seenIds.has(comment.id)) return;
        seenIds.add(comment.id);
        commentMap[comment.id] = normalizeComment(comment);
      });

      Object.values(commentMap).forEach((comment) => {
        if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
          commentMap[comment.parentCommentId].replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      });

      rootComments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const sortReplies = (comments) => {
        comments.forEach((c) => {
          if (c.replies?.length) {
            c.replies.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            // Tự động mở rộng
            newExpanded[c.id] = true;
            sortReplies(c.replies);
          }
        });
      };
      sortReplies(rootComments);

      setComments(rootComments);
      setExpandedReplies(newExpanded);
    } catch (err) {
      console.error("Error fetching comments:", err);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Chạy hàm fetchComments khi postId thay đổi
  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  // --- 2. useEffect MỚI cho SIGNALR ---
  useEffect(() => {
    if (!postId || !userId) return;

    const handleReceiveComment = (newComment) => {
      console.log("signalR: Nhận comment mới", newComment);
      setComments((prevComments) => {
        if (findCommentById(prevComments, newComment.id)) return prevComments;

        const normalized = normalizeComment(newComment);

        if (normalized.parentCommentId) {
          const addReply = (comments) => {
            return comments.map((c) => {
              if (c.id === normalized.parentCommentId) {
                return { ...c, replies: [...c.replies, normalized] };
              }
              if (c.replies?.length > 0) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          setExpandedReplies((prev) => ({
            ...prev,
            [normalized.parentCommentId]: true,
          }));
          return addReply(prevComments);
        } else {
          return [normalized, ...prevComments];
        }
      });
    };

    const handleUpdateComment = (updatedComment) => {
      console.log("signalR: Nhận cập nhật", updatedComment);
      setComments((prevComments) => {
        const update = (commentsList) => {
          return commentsList.map((c) => {
            if (c.id === updatedComment.id) {
              return { ...c, ...updatedComment, replies: c.replies };
            }
            if (c.replies?.length > 0) {
              return { ...c, replies: update(c.replies) };
            }
            return c;
          });
        };
        return update(prevComments);
      });
    };

    const handleDeleteComment = (commentId) => {
      console.log("signalR: Nhận xóa", commentId);
      setComments((prevComments) => {
        const remove = (comments, idToRemove) => {
          return comments.reduce((acc, c) => {
            if (c.id === idToRemove) return acc;
            if (c.replies?.length > 0) {
              return [...acc, { ...c, replies: remove(c.replies, idToRemove) }];
            }
            return [...acc, c];
          }, []);
        };
        return remove(prevComments, commentId);
      });
    };

    const handleReceiveLikeUpdate = (commentId, totalLikes) => {
      console.log(`signalR: Nhận Like Update cho ${commentId}: ${totalLikes}`);

      setComments((prevComments) => {
        const updateLike = (commentsList) => {
          return commentsList.map((c) => {
            if (c.id === commentId) {
              return { ...c, likeCount: totalLikes };
            }
            if (c.replies?.length > 0) {
              return { ...c, replies: updateLike(c.replies) };
            }
            return c;
          });
        };
        return updateLike(prevComments);
      });
    };

    signalRService
      .startConnection()
      .then(() => {
        signalRService.joinPostGroup(postId);
        signalRService.onCommentReceived(handleReceiveComment);
        signalRService.onCommentUpdated(handleUpdateComment);
        signalRService.onCommentDeleted(handleDeleteComment);
        signalRService.onLikeUpdate(handleReceiveLikeUpdate);
      })
      .catch((err) =>
        console.log(
          "SignalR connection failed (có thể do chưa đăng nhập): ",
          err
        )
      );

    return () => {
      console.log(`Dọn dẹp SignalR cho post ${postId}`);
      signalRService.leavePostGroup(postId);
      signalRService.offCommentReceived();
      signalRService.offCommentUpdated();
      signalRService.offCommentDeleted();
      signalRService.offLikeUpdate();
    };
  }, [postId, userId]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return toast.warning("Vui lòng nhập bình luận");
    if (!userId) return toast.warning("Vui lòng đăng nhập");

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await commentApi.update({
          commentId: editingId,
          contents: commentText,
        });
        const updatedComment = res?.data?.data;

        if (updatedComment) {
          setComments((prev) => {
            const update = (commentsList) => {
              return commentsList.map((c) => {
                if (c.id === editingId) {
                  return { ...c, ...updatedComment, replies: c.replies };
                }
                if (c.replies?.length > 0) {
                  return { ...c, replies: update(c.replies) };
                }
                return c;
              });
            };
            return update(prev);
          });
        }

        toast.success("Cập nhật bình luận thành công");
        setEditingId(null);
      } else {
        const res = await commentApi.create({
          postId,
          contents: commentText,
          parentCommentId: null,
        });

        const newComment = res?.data?.data;
        if (!newComment) throw new Error("Không nhận được dữ liệu comment mới");

        const normalized = normalizeComment(newComment);

        setComments((prev) => {
          if (findCommentById(prev, normalized.id)) {
            return prev;
          }
          return [normalized, ...prev];
        });

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
      if (!newReply) throw new Error("Không nhận được dữ liệu trả lời");

      const normalizedReply = normalizeComment(newReply);
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
      await commentApi.delete(deleteCommentId);

      setComments((prev) => {
        const remove = (comments, idToRemove) => {
          return comments.reduce((acc, c) => {
            if (c.id === idToRemove) return acc;
            if (c.replies?.length > 0) {
              return [...acc, { ...c, replies: remove(c.replies, idToRemove) }];
            }
            return [...acc, c];
          }, []);
        };
        return remove(prev, deleteCommentId);
      });

      toast.success("Xóa bình luận thành công");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa bình luận");
    } finally {
      setDeleteModalVisible(false);
      setDeleteCommentId(null);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!userId) return toast.warning("Vui lòng đăng nhập");

    // Find current like count
    let currentLikeCount = 0;
    const comment = findCommentById(comments, commentId);
    if (comment) {
      currentLikeCount = comment.likeCount || 0;
    }

    const wasLiked = likedComments.has(commentId);

    // Optimistic update for liked state
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    // Optimistic update for like count
    const updateLike = (comments, id, newCount) => {
      return comments.map((c) => {
        if (c.id === id) return { ...c, likeCount: newCount };
        if (c.replies?.length > 0)
          return { ...c, replies: updateLike(c.replies, id, newCount) };
        return c;
      });
    };

    const newCount = wasLiked
      ? Math.max(0, currentLikeCount - 1)
      : currentLikeCount + 1;
    setComments((prev) => updateLike(prev, commentId, newCount));

    try {
      const res = await commentApi.toggleLike(commentId);
      const actualLikes = res?.data?.data?.totalLikes ?? newCount;

      // Update with actual count from server
      setComments((prev) => updateLike(prev, commentId, actualLikes));
    } catch (err) {
      // Rollback on error
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      setComments((prev) => updateLike(prev, commentId, currentLikeCount));
      toast.error("Lỗi khi thích bình luận");
    }
  };

  const handleReportComment = async () => {
    if (!reportReason.trim()) return toast.warning("Vui lòng nhập lý do");
    try {
      await commentApi.report({
        commentPostId: reportCommentId,
        reason: reportReason,
      });
      toast.success("Báo cáo thành công");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi báo cáo");
    } finally {
      setReportModalVisible(false);
      setReportCommentId(null);
      setReportReason("");
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

  // --- HÀM RENDER ĐỆ QUY ---
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
    const isLiked = likedComments.has(comment.id);

    return (
      <div key={uniqueKey}>
        <CommentItem
          comment={comment}
          isReply={isReply}
          isOwner={isOwner}
          showReplies={showReplies}
          replyingToId={replyingToId}
          isLiked={isLiked}
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

  // --- 4. JSX ---
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
          loading={loading}
        >
          Tải lại
        </Button>
      </div>

      {deletedCommentNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm text-green-800">{deletedCommentNotification}</p>
        </motion.div>
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
          <AnimatePresence>
            {comments.map((comment) => renderComment(comment, false, 0))}
          </AnimatePresence>
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
