import React from "react";
import { Input, Button, Avatar } from "antd";
import { Send } from "lucide-react";

const CommentForm = ({
  userAvatar,
  userId,
  commentText,
  setCommentText,
  submitting,
  editingId,
  replyingToId,
  onSubmit,
  onCancel,
  isInline = false, // For inline reply forms
  rows = 3,
}) => {
  const isEditing = !!editingId;
  const isReplying = !!replyingToId;

  if (isInline) {
    // Inline reply form (smaller, embedded in comment)
    return (
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
              <Button size="small" onClick={onCancel} className="rounded">
                Hủy
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={onSubmit}
                loading={submitting}
                className="rounded bg-indigo-600 border-0"
              >
                Trả lời
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main comment form
  return (
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
            rows={isEditing || isReplying ? 4 : rows}
            maxLength={1000}
            className="rounded-lg resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {commentText.length}/1000 ký tự
            </span>
            <div className="flex gap-2">
              {(isEditing || isReplying) && (
                <Button onClick={onCancel} className="rounded-lg">
                  Hủy
                </Button>
              )}
              <Button
                type="primary"
                onClick={onSubmit}
                loading={submitting}
                disabled={!userId || !commentText.trim()}
                icon={<Send size={14} />}
                className="rounded-lg bg-indigo-600 border-0"
              >
                {isEditing ? "Cập nhật" : isReplying ? "Trả lời" : "Gửi"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;