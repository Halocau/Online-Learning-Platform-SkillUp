// Đường dẫn: src/pages/forum/components/CommentSection.jsx
// (Hãy copy và dán toàn bộ code này để thay thế file cũ)

import React, { useState, useEffect, useCallback } from "react";
import { Spin, Empty, Divider, Button } from "antd";
import { MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import CommentModals from "./CommentModal";
import commentApi from "@/api/commentAPI";
import ReplyForm from "./ReplyForm";
import signalRService from "./SignalRService"; // <-- THÊM DÒNG NÀY

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
    // Chỉ chạy khi có postId VÀ user đã đăng nhập (để có token)
    if (!postId || !userId) return;

    // === Các hàm xử lý state khi nhận tín hiệu ===

    // Khi nhận comment mới
    const handleReceiveComment = (newComment) => {
      console.log("signalR: Nhận comment mới", newComment);
      setComments((prevComments) => {
        // Kiểm tra trùng lặp
        if (findCommentById(prevComments, newComment.id)) return prevComments;

        const normalized = normalizeComment(newComment);

        if (normalized.parentCommentId) {
          // Đây là một reply
          const addReply = (comments) => {
            return comments.map((c) => {
              if (c.id === normalized.parentCommentId) {
                // Thêm reply mới vào cuối danh sách
                return { ...c, replies: [...c.replies, normalized] };
              }
              if (c.replies?.length > 0) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          // Tự động mở rộng comment cha
          setExpandedReplies((prev) => ({
            ...prev,
            [normalized.parentCommentId]: true,
          }));
          return addReply(prevComments);
        } else {
          // Đây là một root comment mới (thêm vào đầu danh sách)
          return [normalized, ...prevComments];
        }
      });
    };

    // Khi nhận cập nhật
    const handleUpdateComment = (updatedComment) => {
      console.log("signalR: Nhận cập nhật", updatedComment);
      setComments((prevComments) => {
        const update = (commentsList) => {
          return commentsList.map((c) => {
            if (c.id === updatedComment.id) {
              // Cập nhật nội dung/like, giữ nguyên replies
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

    // Khi nhận xóa (nhận về commentId)
    const handleDeleteComment = (commentId) => {
      console.log("signalR: Nhận xóa", commentId);
      setComments((prevComments) => {
        const remove = (comments, idToRemove) => {
          return comments.reduce((acc, c) => {
            if (c.id === idToRemove) return acc; // Lọc bỏ
            if (c.replies?.length > 0) {
              return [...acc, { ...c, replies: remove(c.replies, idToRemove) }];
            }
            return [...acc, c];
          }, []);
        };
        return remove(prevComments, commentId);
      });
    };

    // === Kết nối và lắng nghe ===

    signalRService
      .startConnection()
      .then(() => {
        signalRService.joinPostGroup(postId);

        // Đăng ký các hàm lắng nghe
        signalRService.onCommentReceived(handleReceiveComment);
        signalRService.onCommentUpdated(handleUpdateComment);
        signalRService.onCommentDeleted(handleDeleteComment);
      })
      .catch((err) =>
        console.log(
          "SignalR connection failed (có thể do chưa đăng nhập): ",
          err
        )
      );

    // Dọn dẹp (rất quan trọng)
    return () => {
      console.log(`Dọn dẹp SignalR cho post ${postId}`);
      signalRService.leavePostGroup(postId);

      // Gỡ lắng nghe
      signalRService.offCommentReceived();
      signalRService.offCommentUpdated();
      signalRService.offCommentDeleted();
      // Không gọi stopConnection() ở đây, để giữ kết nối cho trang khác
    };
  }, [postId, userId]); // Chạy lại khi đổi PostId hoặc user (đăng nhập)

  // --- 3. CÁC HÀM SUBMIT VÀ HANDLER (Giữ nguyên logic của bạn) ---
  // Các hàm này (handleSubmit, handleDelete...) vẫn cập nhật state
  // ngay lập tức (Optimistic Update) để UI mượt mà.
  // SignalR sẽ lo việc cập nhật cho *các user khác*.

  // Thay thế TOÀN BỘ hàm handleSubmitComment bằng code này

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return toast.warning("Vui lòng nhập bình luận");
    if (!userId) return toast.warning("Vui lòng đăng nhập");

    setSubmitting(true);
    try {
      if (editingId) {
        // --- LOGIC UPDATE (CẬP NHẬT) ---
        // Block này gọi commentApi.update

        const res = await commentApi.update({
          commentId: editingId,
          contents: commentText,
        });
        const updatedComment = res?.data?.data;

        // Cập nhật state (để UI mượt)
        if (updatedComment) {
          setComments((prev) => {
            const update = (commentsList) => {
              return commentsList.map((c) => {
                if (c.id === editingId) {
                  // Giữ nguyên replies, cập nhật phần còn lại
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
        // --- LOGIC CREATE (TẠO MỚI) ---
        // Block này gọi commentApi.create

        const res = await commentApi.create({
          postId,
          contents: commentText,
          parentCommentId: null,
        });

        const newComment = res?.data?.data;
        if (!newComment) throw new Error("Không nhận được dữ liệu comment mới");

        // Cập nhật state (để UI mượt)
        const normalized = normalizeComment(newComment);

        // --- ĐÂY LÀ PHẦN SỬA LỖI DOUBLE ---
        // Chỉ thêm vào state NẾU nó chưa tồn tại
        // (Phòng trường hợp SignalR chạy về trước)
        setComments((prev) => {
          if (findCommentById(prev, normalized.id)) {
            return prev; // Đã tồn tại (do SignalR), không làm gì cả
          }
          return [normalized, ...prev]; // Thêm mới
        });
        // --- KẾT THÚC PHẦN SỬA ---

        toast.success("Bình luận thành công");
      }

      // Xóa nội dung ô nhập liệu (cho cả 2 trường hợp)
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

      // Cập nhật state (để UI mượt)
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

      // Cập nhật state (để UI mượt)
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

    const updateLike = (comments, id, fn) => {
      return comments.map((c) => {
        if (c.id === id) return { ...c, likeCount: fn(c.likeCount ?? 0) };
        if (c.replies?.length > 0)
          return { ...c, replies: updateLike(c.replies, id, fn) };
        return c;
      });
    };

    // Optimistic Update: Cập nhật UI trước
    setComments((prev) => updateLike(prev, commentId, (c) => c + 1));

    try {
      // Gọi API
      const res = await commentApi.toggleLike(commentId);
      const actualLikes = res?.data?.data?.totalLikes ?? 0;

      // Cập nhật lại state với số like CHUẨN từ server
      setComments((prev) => updateLike(prev, commentId, () => actualLikes));
    } catch (err) {
      // Rollback nếu lỗi
      setComments((prev) =>
        updateLike(prev, commentId, (c) => Math.max(0, c - 1))
      );
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

  // --- HÀM RENDER ĐỆ QUY (Giữ nguyên) ---
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

  // --- 4. JSX (Giữ nguyên) ---
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
