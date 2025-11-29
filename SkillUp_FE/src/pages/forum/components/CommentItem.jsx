import React from "react";
import { Avatar, Tooltip } from "antd";
import {
  Heart,
  Trash2,
  Edit2,
  MessageCircle,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const CommentItem = ({
  comment,
  isReply = false,
  isOwner,
  showReplies,
  replyingToId,
  isLiked = false,
  onEdit,
  onDelete,
  onReport,
  onToggleLike,
  onReply,
  onToggleReplies,
  children,
}) => {
  const commentId = comment.id;
  const likeCount = comment.likeCount ?? 0;
  const replies = comment.replies ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
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
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(comment)}
                  className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded transition-colors"
                >
                  <Edit2 size={14} />
                </motion.button>
              </Tooltip>
              <Tooltip title="Xóa">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(commentId)}
                  className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </motion.button>
              </Tooltip>
            </div>
          )}
          {!isOwner && (
            <Tooltip title="Báo cáo">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReport(commentId)}
                className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
              >
                <Flag size={14} />
              </motion.button>
            </Tooltip>
          )}
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap break-words">
          {comment.contents}
        </p>

        <div className="flex items-center gap-4 text-xs">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleLike(commentId)}
            className={`flex items-center gap-1 font-medium transition-all ${
              isLiked
                ? "text-pink-600"
                : "text-gray-500 hover:text-pink-600"
            }`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                size={14}
                fill={isLiked ? "currentColor" : "none"}
                className={isLiked ? "drop-shadow-sm" : ""}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={likeCount}
                initial={{ scale: 1.3, color: "#ec4899" }}
                animate={{ scale: 1, color: isLiked ? "#ec4899" : undefined }}
                transition={{ duration: 0.2 }}
              >
                {likeCount}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReply(commentId)}
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <MessageCircle size={14} />
            <span>Trả lời</span>
          </motion.button>
        </div>

        {/* Reply form if this comment is being replied to */}
        <AnimatePresence>
          {replyingToId === commentId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle replies button and nested replies */}
        {replies.length > 0 && (
          <div className="mt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleReplies(commentId)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <motion.div
                animate={{ rotate: showReplies ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showReplies ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </motion.div>
              {showReplies ? "Ẩn" : "Hiển thị"} {replies.length} trả lời
            </motion.button>

            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;