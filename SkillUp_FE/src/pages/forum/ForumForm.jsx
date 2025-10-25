// src/pages/forum/ForumForm.jsx
import React, { useEffect, useState } from "react";
import { Input, Button, Select, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import { categoryApi } from "@/api/forumCategory";

const { TextArea } = Input;

export default function ForumForm({ isEdit = false }) {
  const params = useParams();
  const postId = params.postId;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    Title: "",
    Contents: "",
    ForumCategoryId: "",
    images: [],
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit || postId) loadPost();
  }, [postId]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPost = async () => {
    setLoading(true);
    try {
      
      const res = await postApi.getById(postId);
      const payload = res?.data?.data ?? res?.data ?? res;
      const p = Array.isArray(payload) ? payload[0] : payload;
      setForm({
        Title: p.Title ?? p.title ?? "",
        Contents: p.Contents ?? p.contents ?? "",
        ForumCategoryId: p.ForumCategoryId ?? p.forumCategoryId ?? "",
        images: [], 
      });
    } catch (err) {
      console.error("Failed to load post", err);
      message.error("Failed to load post data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.Title || !form.Contents || !form.ForumCategoryId) {
      message.warning("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const formData = new FormData();
      formData.append("AccountId", user.id || user.Id || localStorage.getItem("accountId"));
      formData.append("ForumCategoryId", form.ForumCategoryId);
      formData.append("Title", form.Title);
      formData.append("Contents", form.Contents);
      form.images.forEach(f => formData.append("Images", f.originFileObj || f));

      if (isEdit || postId) {
        await postApi.update(postId, formData);
        message.success("Updated");
        navigate(`/forum/${postId}`);
      } else {
        const res = await postApi.create(formData);
        const createdId = res?.data?.data?.Id ?? res?.data?.data ?? null;
        message.success("Created");
        
        const id = res?.data?.data?.Id ?? res?.data?.data;
        if (id) navigate(`/forum/${id}`);
        else navigate("/forum");
      }
    } catch (err) {
      console.error(err);
      message.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12"><Spin /></div>;

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{isEdit || postId ? "Edit Post" : "Create a post"}</h2>

      <div className="space-y-3">
        <Select
          placeholder="Choose categories"
          value={form.ForumCategoryId}
          onChange={(v) => setForm({ ...form, ForumCategoryId: v })}
          className="w-full"
        >
          {categories.map(c => <Select.Option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.name ?? c.Name}</Select.Option>)}
        </Select>

        <Input
          placeholder="Type catching attention title"
          value={form.Title}
          onChange={(e) => setForm({ ...form, Title: e.target.value })}
        />

        <TextArea
          rows={10}
          placeholder="Type your question"
          value={form.Contents}
          onChange={(e) => setForm({ ...form, Contents: e.target.value })}
        />

        <Upload
          multiple
          beforeUpload={() => false}
          onChange={({ fileList }) => setForm({ ...form, images: fileList })}
        >
          <Button icon={<UploadOutlined />}>Add Image</Button>
        </Upload>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {isEdit || postId ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}