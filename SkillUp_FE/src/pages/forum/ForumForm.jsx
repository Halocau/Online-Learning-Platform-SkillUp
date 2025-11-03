import React, { useEffect, useState } from "react";
import { Input, Button, Select, Upload, message, Spin, Divider } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import { categoryApi } from "@/api/forumCategory";
import { toast } from "react-toastify";
import { ArrowLeft, FileUp } from "lucide-react";

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
      toast.error("Không thể tải danh mục");
    }
  };

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await postApi.getById(postId);
      const payload = res?.data?.data ?? res?.data ?? res;
      const p = Array.isArray(payload) ? payload[0] : payload;

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
      toast.warning("Hãy điền đầy đủ các trường bắt buộc!");
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
        toast.success("Cập nhật bài viết thành công!");
        navigate(`/forum/${postId}`);
      } else {
        const res = await postApi.create(formData);
        toast.success("Tạo bài viết thành công!");
        const myId = localStorage.getItem("userId");
        if (myId) {
          navigate(`/forum/user/${myId}`);
        } else {
          navigate("/forum");
        }
      }
    } catch (err) {
      console.error("Create post error:", err.response?.data || err);
      toast.warning(err.response?.data?.message || "Lưu bài viết thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit || postId ? "Cập nhật bài viết" : "Tạo bài viết mới"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isEdit || postId
                ? "Chỉnh sửa nội dung bài viết của bạn"
                : "Chia sẻ điều gì đó có giá trị với cộng đồng"}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Chọn danh mục cho bài viết của bạn"
                value={form.ForumCategoryId || undefined}
                onChange={(v) => setForm({ ...form, ForumCategoryId: v })}
                className="w-full"
                disabled={isEdit || !!postId}
                size="large"
                optionLabelProp="label"
              >
                {categories.map((c, i) => (
                  <Select.Option
                    key={c.Id ?? c.id ?? i}
                    value={c.Id ?? c.id}
                    label={
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        {c.Name ?? c.name}
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {c.Name ?? c.name}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            <Divider className="my-4" />

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                value={form.Title}
                onChange={(e) => setForm({ ...form, Title: e.target.value })}
                size="large"
                maxLength={200}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-2">
                {form.Title.length}/200 ký tự
              </p>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <TextArea
                rows={12}
                placeholder="Viết nội dung chi tiết của bài viết... Bạn có thể sử dụng Markdown để định dạng."
                value={form.Contents}
                onChange={(e) => setForm({ ...form, Contents: e.target.value })}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                {form.Contents.length} ký tự
              </p>
            </div>

            <Divider className="my-4" />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Hình ảnh (Tối đa 8 ảnh, mỗi ảnh {'<'} 10MB)
              </label>
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
                itemRender={(originNode, file, fileList) => (
                  <div className="rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors">
                    {originNode}
                  </div>
                )}
              >
                {form.images.length < 8 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-4 hover:bg-gray-50 transition-colors">
                    <FileUp size={24} className="text-gray-400" />
                    <div className="text-sm font-medium text-gray-700">
                      Thêm ảnh
                    </div>
                    <div className="text-xs text-gray-400">
                      {form.images.length}/8
                    </div>
                  </div>
                )}
              </Upload>
            </div>

            <Divider className="my-6" />

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 pt-4">
              <Button
                onClick={() => navigate(-1)}
                size="large"
                className="flex-1 rounded-lg border-gray-300 text-gray-700 font-medium hover:border-gray-400"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                size="large"
                className="flex-1 rounded-lg bg-indigo-600 border-0 font-medium hover:bg-indigo-700"
              >
                {isEdit || postId ? "Cập nhật bài viết" : "Đăng bài viết"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}