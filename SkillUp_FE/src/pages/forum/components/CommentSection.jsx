import React from "react";
import { Input, Button } from "antd";

const CommentSection = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <p className="text-gray-500 mb-4">
        (Comment feature coming soon...)
      </p>

      <div className="flex gap-2">
        <Input.TextArea
          placeholder="Write your comment..."
          disabled
          rows={2}
        />
        <Button type="primary" disabled>
          Post
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
