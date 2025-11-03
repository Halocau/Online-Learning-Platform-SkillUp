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

dayjs.extend(relativeTime);
dayjs.locale("vi");

const CommentItem = ({
  comment,
  isReply = false,
  isOwner,
  showReplies,
  replyingToId,
  onEdit,
  onDelete,
  onReport,
  onToggleLike,
  onReply,
  onToggleReplies,
  children, // For reply form and nested replies
}) => {
  const commentId = comment.id;
  const likeCount = comment.likeCount ?? 0;
  const replies = comment.replies ?? [];

  return (
    <div
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
                  onClick={() => onEdit(comment)}
                  className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </Tooltip>
              <Tooltip title="Xóa">
                <button
                  onClick={() => onDelete(commentId)}
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
                onClick={() => onReport(commentId)}
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
            onClick={() => onToggleLike(commentId)}
            className="flex items-center gap-1 text-gray-500 hover:text-pink-600 font-medium transition-colors"
          >
            <Heart size={14} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => onReply(commentId)}
            className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <MessageCircle size={14} />
            <span>Trả lời</span>
          </button>
        </div>

        {/* Reply form if this comment is being replied to */}
        {replyingToId === commentId && children}

        {/* Toggle replies button and nested replies */}
        {replies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => onToggleReplies(commentId)}
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
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;