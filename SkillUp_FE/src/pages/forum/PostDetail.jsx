import React, { useEffect, useState } from "react";
import { postApi } from "@/api/postAPI";
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { Spin, Button, Modal, Avatar, Divider } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "@/pages/forum/components/CommentSection";
import { Edit, Trash2, ArrowLeft, Calendar, User } from "lucide-react";
import { toast } from "react-toastify";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useOutletContext?.();

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    postApi
      .getById(postId)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const p = Array.isArray(payload) ? payload[0] : payload;
        setPost(p);
      })
      .catch(() => {
        toast.error("Không thể tải bài viết");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 mb-6">
            Bài viết này có thể đã bị xóa hoặc bạn không có quyền truy cập
          </p>
          <Link to="/forum">
            <Button
              type="primary"
              className="rounded-lg bg-indigo-600 border-0"
            >
              Quay lại diễn đàn
            </Button>
          </Link>
        </div>
      </div>
    );

  const images = post.imageUrls ?? [];

  const currentUserId = localStorage.getItem("userId");
  const currentUserFromStorage = localStorage.getItem("user");
  const currentUser = currentUserFromStorage
    ? JSON.parse(currentUserFromStorage)
    : null;

  const postAccountId = String(post.accountId ?? post.AccountId ?? "");

  const isOwner =
    (currentUserId && String(currentUserId) === postAccountId) ||
    (currentUser?.id && String(currentUser.id) === postAccountId) ||
    (currentUser?.Id && String(currentUser.Id) === postAccountId);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await postApi.delete(post.id);
      toast.success("Xóa bài viết thành công!");
      // Navigate to user's profile instead of forum home
      const userId = post.accountId ?? post.AccountId;
      navigate(`/forum/user/${userId}`);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Xóa bài viết thất bại");
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const categoryName = post.categoryName || "Chưa phân loại";
  const createdDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/forum" className="inline-flex mb-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 p-2 hover:bg-white rounded-lg">
            <ArrowLeft size={18} />
            <span>Quay lại diễn đàn</span>
          </button>
        </Link>

        {/* Main Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Featured Image */}
          {images.length > 0 && (
            <div className="relative h-80 bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden">
              <img
                src={images[0]}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-10">
            {/* Header with Author Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="flex-1">
                {/* Category */}
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {categoryName}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <Avatar
                    src={
                      post.avatarUrl ||
                      `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(
                        post.accountName || "User"
                      )}&background=random`
                    }
                    alt={post.accountName}
                    size={48}
                    className="border-2 border-gray-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-900">
                        {post.accountName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={14} />
                      <span>{createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - NOW WITH DEBUG INFO */}
              {isOwner ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="default"
                    icon={<Edit size={14} />}
                    onClick={() => navigate(`/forum/edit/${post.id}`)}
                    className="rounded-lg border-gray-300 font-medium"
                  >
                    Sửa
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<Trash2 size={14} />}
                    onClick={() => setDeleteModalVisible(true)}
                    className="rounded-lg font-medium"
                  >
                    Xóa
                  </Button>
                </div>
              ) : (
                // TEMPORARY DEBUG DISPLAY - Remove after fixing
                <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
                  Not owner (check console)
                </div>
              )}
            </div>

            <Divider className="my-8" />

            {/* Post Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.contents}
                </ReactMarkdown>
              </div>
            </div>

            {/* Images Gallery */}
            {images.length > 1 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hình ảnh ({images.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.slice(1).map((u, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 group"
                    >
                      <img
                        src={u}
                        alt={`Post image ${i + 1}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          title="Xóa bài viết"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: deleting }}
          centered
          wrapClassName="rounded-lg"
        >
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không
            thể hoàn tác.
          </p>
        </Modal>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
}
