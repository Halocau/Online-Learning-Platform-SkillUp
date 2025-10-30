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
      const activeCategories = (res.data.data || res.data || []).filter(
        (c) => c.isActive ?? c.IsActive
      );
      setCategories(activeCategories);
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

      // ✅ Map existing image URLs for AntD Upload preview
      const imageList =
        (p.imageUrls || []).map((url, index) => ({
          uid: index,
          name: `image-${index}`,
          status: "done",
          url,
        })) ?? [];

      setForm({
        Title: p.title || p.Title || "",
        Contents: p.contents || p.Contents || "",
        ForumCategoryId:
          p.forumCategoryId || p.ForumCategoryID || p.ForumCategoryId || null,
        images: imageList,
      });
    } catch (err) {
      console.error("Lấy bài viết thất bại", err);
      toast.error("Lấy bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.Title || !form.Contents || !form.ForumCategoryId) {
      toast.warning("Hãy điền đầy đủ mục cần thiết !");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("ForumCategoryId", Number(form.ForumCategoryId));
      formData.append("Title", form.Title);
      formData.append("Contents", form.Contents);
      form.images.forEach((f) => {
        if (f.originFileObj) formData.append("Images", f.originFileObj);
        else if (f.url) formData.append("ExistingImages", f.url);
      });

      if (isEdit || postId) {
        await postApi.update(postId, formData);
        toast.success("Cập nhật bài viết thành công !");
        navigate(`/forum/${postId}`);
      } else {
        const res = await postApi.create(formData);
        const created = res?.data?.data?.[0] ?? res?.data ?? res;
        toast.success("Tạo bài viết thành công !");
        const myId = localStorage.getItem("userId");
        if (myId) {
          navigate(`/forum/user/${myId}`);
        } else {
          navigate("/forum");
        }
      }
    } catch (err) {
      console.error("Create post error:", err.response?.data || err);
      toast.warning(err.response?.data?.message || "Lưu bài viết thất bại !");
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
        {isEdit || postId ? "Câp nhật bài viết" : "Tạo bài viết mới"}
      </h2>

      <div className="space-y-3">
        <label className="block text-sm font-medium mb-1">Danh mục *</label>
        <Select
          placeholder="Chọn danh mục"
          value={form.ForumCategoryId || undefined}
          onChange={(v) => setForm({ ...form, ForumCategoryId: v })}
          className="w-full"
          disabled={isEdit || !!postId}
        >
          {categories.map((c, i) => (
            <Select.Option key={c.Id ?? c.id ?? i} value={c.Id ?? c.id}>
              {c.Name ?? c.name}
            </Select.Option>
          ))}
        </Select>

        <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
        <Input
          placeholder="Tiêu đề"
          value={form.Title}
          onChange={(e) => setForm({ ...form, Title: e.target.value })}
        />
        <label className="block text-sm font-medium mb-1">Nội dung *</label>
        <TextArea
          rows={10}
          placeholder="Nội dung bài đăng"
          value={form.Contents}
          onChange={(e) => setForm({ ...form, Contents: e.target.value })}
        />

        <Upload
          multiple
          listType="picture-card"
          fileList={form.images}
          beforeUpload={() => false}
          onChange={({ fileList }) => {
            const valid = fileList.filter((f) => {
              if (f.size > 10 * 1024 * 1024) {
                message.error(`${f.name} quá lớn (>10MB)`);
                return false;
              }
              return true;
            });
            setForm({ ...form, images: valid });
          }}
        >
          {form.images.length >= 8 ? null : (
            <div>
              <UploadOutlined />
              <div className="mt-1">Thêm ảnh</div>
            </div>
          )}
        </Upload>

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={() => navigate(-1)}>Hủy</Button>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {isEdit || postId ? "Câp nhật" : "Đăng bài"}
          </Button>
        </div>
      </div>
    </div>
  );
}
