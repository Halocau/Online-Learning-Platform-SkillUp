import React, { useState } from "react";
import { Input, Button, Select, Card, message, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const { Option } = Select;

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !category || !content) {
      message.warning("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/posts", { title, category, content });
      message.success("Post created successfully!");
      setTitle("");
      setCategory("");
      setContent("");
    } catch (error) {
      message.error("Failed to create post!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex justify-center py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="w-full max-w-4xl shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Create a New Post</h2>
          <Badge variant="secondary">Forum</Badge>
        </div>

        <Space direction="vertical" size="large" className="w-full">
          <Input
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="large"
          />

          <Select
            placeholder="Select a category"
            value={category}
            onChange={setCategory}
            size="large"
            className="w-full"
          >
            <Option value="general">General</Option>
            <Option value="question">Question</Option>
            <Option value="announcement">Announcement</Option>
            <Option value="discussion">Discussion</Option>
          </Select>

          <Editor
            apiKey="your_tinymce_api_key"
            value={content}
            onEditorChange={setContent}
            init={{
              height: 400,
              menubar: true,
              plugins:
                "preview code link lists image media table wordcount fullscreen",
              toolbar:
                "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | image media link | fullscreen preview",
              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />

          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            className="self-end"
          >
            Publish Post
          </Button>
        </Space>
      </Card>
    </motion.div>
  );
};

export default CreatePost;
