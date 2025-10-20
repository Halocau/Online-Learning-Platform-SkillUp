import React, { useState } from "react";
import { Input, Button, Select, Card, message, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";

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
      console.error(error);
      message.error("Failed to create post!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <Card
        title="📝 Create a New Post"
        className="w-full max-w-4xl shadow-lg rounded-2xl"
      >
        <Space direction="vertical" size="large" className="w-full">
          {/* Title Input */}
          <Input
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="large"
          />

          {/* Category Select */}
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

          {/* TinyMCE Editor */}
          <Editor
            apiKey="your_tinymce_api_key" // Replace with your TinyMCE API key (https://www.tiny.cloud/)
            value={content}
            onEditorChange={(newValue) => setContent(newValue)}
            init={{
              height: 400,
              menubar: true,
              plugins:
                "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help emoticons",
              toolbar:
                "undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code fullscreen preview",
              image_caption: true,
              image_advtab: true,
              automatic_uploads: true,
              file_picker_types: "image",
              file_picker_callback: (callback) => {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.onchange = function () {
                  const file = this.files[0];
                  const reader = new FileReader();
                  reader.onload = function () {
                    callback(reader.result, { alt: file.name });
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              },
            }}
          />

          {/* Submit Button */}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
          >
            Publish Post
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CreatePost;
