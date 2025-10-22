// src/pages/forum/EditPost.jsx
import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Spin, message, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { useParams } from "react-router-dom";

const { Option } = Select;
const EditPost = ({ postId: propPostId = null, visible: propVisible = true, onClose } = {}) => {
  const params = useParams();
  const postId = propPostId || params?.postId;
  const [visible, setVisible] = useState(Boolean(propVisible));
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  // Sync prop visible -> local visible (if prop is passed)
  useEffect(() => {
    if (typeof propVisible === "boolean") setVisible(propVisible);
  }, [propVisible]);


  const close = (reason) => {
    setVisible(false);
    if (typeof onClose === "function") onClose(reason);
  };

 
  useEffect(() => {
    if (!postId) {
      setFetching(false);
      return;
    }

    const fetchPost = async () => {
      setFetching(true);
      try {
        const res = await axios.get(`/api/posts/${postId}`);
        const data = res.data || {};
        setTitle(data.title || "");
        setCategory(data.category || "");
        setContent(data.content || "");
      } catch (err) {
        console.error("Failed to fetch post:", err);
        message.error("Failed to load post data.");
        close("error");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();

  }, [postId]);

 
  const handleUpdate = async () => {
    if (!title.trim() || !category || !content.trim()) {
      message.warning("Please fill all fields before updating.");
      return;
    }

    try {
      setSaving(true);
      await axios.put(`/api/posts/${postId}`, { title, category, content });
      message.success("Post updated successfully!");
      close("updated");
    } catch (err) {
      console.error("Update failed:", err);
      message.error("Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  
  if (!postId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4">No Post selected to edit.</p>
          <Button onClick={() => close("no-id")}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <Modal
      title="✏️ Edit Post"
      open={visible}
      onCancel={() => close("cancel")}
      footer={null}
      width={900}
      bodyStyle={{ padding: 18 }}
      destroyOnClose={true}
    >
      {fetching ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="large"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                value={category}
                onChange={(val) => setCategory(val)}
                size="large"
                style={{ width: "100%" }}
                placeholder="Select a category"
              >
                <Option value="general">General</Option>
                <Option value="question">Question</Option>
                <Option value="announcement">Announcement</Option>
                <Option value="discussion">Discussion</Option>
              </Select>
            </div>

            {/* TinyMCE Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <Editor
                apiKey="your_tinymce_api_key" // replace with your TinyMCE key or remove if self-hosting
                value={content}
                onEditorChange={(newVal) => setContent(newVal)}
                init={{
                  height: 360,
                  menubar: true,
                  plugins:
                    "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help emoticons",
                  toolbar:
                    "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat | code fullscreen preview",
                  automatic_uploads: true,
                  image_caption: true,
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
                  content_style: "body { font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px }",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-2">
              <Button onClick={() => close("cancel")}>Cancel</Button>
              <Button type="primary" loading={saving} onClick={handleUpdate}>
                Update Post
              </Button>
            </div>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default EditPost;
