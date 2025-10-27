// src/pages/forum/ForumForm.jsx
import React, { useEffect, useState } from "react";
import { Input, Button, Select, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import { categoryApi } from "@/api/forumCategory";
import { toast } from "react-toastify";

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
    ForumCategoryId: null,
    images: [],
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit || postId) loadPost();
  }, [postId]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      console.log("Categories API response:", res.data);
      setCategories(res.data.data || res.data || []);
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
        ForumCategoryId:
          p.ForumCategoryId ?? p.forumCategoryId
            ? Number(p.ForumCategoryId ?? p.forumCategoryId)
            : null,
        images: [],
      });
    } catch (err) {
      console.error("Failed to load post", err);
      toast.error("Failed to load post data");
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
      const formData = new FormData();
      formData.append("ForumCategoryId", Number(form.ForumCategoryId));
      formData.append("Title", form.Title);
      formData.append("Contents", form.Contents);

      form.images.forEach((f) => {
        formData.append("Images", f.originFileObj || f);
      });

      console.log("FormData:", [...formData.entries()]);

      if (isEdit || postId) {
        await postApi.update(postId, formData);
        toast.success("Post updated successfully");
        

        navigate(`/forum/${postId}`);
      } else {
        const res = await postApi.create(formData);
        const created = res?.data?.data?.[0] ?? res?.data ?? res;
        toast.success("Post created successfully");
        toast.warning("Please fill all fields");

        const myId = localStorage.getItem("userId");
        if (myId) {
          navigate(`/forum/user/${myId}`);
        } else {
          navigate("/forum");
        }
      }
    } catch (err) {
      console.error("❌ Create post error:", err.response?.data || err);
      toast.warning(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12">
        <Spin />
      </div>
    );

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit || postId ? "Edit Post" : "Create a post"}
      </h2>

      <div className="space-y-3">
        <Select
          placeholder="Choose category"
          value={form.ForumCategoryId || undefined}
          onChange={(v) => setForm({ ...form, ForumCategoryId: v })}
          className="w-full"
        >
          {categories.map((c, i) => (
            <Select.Option key={c.Id ?? c.id ?? i} value={c.Id ?? c.id}>
              {c.Name ?? c.name}
            </Select.Option>
          ))}
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
