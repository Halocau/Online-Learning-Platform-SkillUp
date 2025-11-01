import React, { useState } from "react";
import { Input, Button, Avatar } from "antd";

const ReplyForm = ({
  userAvatar,
  userId,
  onSubmit,
  onCancel,
  submitting,
  parentCommentId
}) => {
  // Independent state for this reply form
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(replyText, parentCommentId);
      setReplyText(""); // Clear after successful submit
      onCancel(); // Close the form
    } catch (error) {
      // Error handling done in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReplyText("");
    onCancel();
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex gap-2">
        <Avatar src={userAvatar} size={32} className="flex-shrink-0" />
        <div className="flex-1">
          <Input.TextArea
            placeholder="Viết trả lời..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            maxLength={1000}
            className="rounded resize-none"
            disabled={!userId || isSubmitting}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {replyText.length}/1000 ký tự
            </span>
            <div className="flex gap-2">
              <Button size="small" onClick={handleCancel} className="rounded">
                Hủy
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={handleSubmit}
                loading={isSubmitting || submitting}
                disabled={!replyText.trim() || !userId}
                className="rounded bg-indigo-600 border-0"
              >
                Trả lời
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm;