import React, { useEffect, useState } from "react";
import { postApi } from "@/api/postAPI";
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { Spin, Button, Modal, Avatar, Divider, Tooltip, Input } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "@/pages/forum/components/CommentSection";
import { Edit, Trash2, ArrowLeft, Calendar, User, Flag } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

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

  const handleReportClick = () => {
    if (!currentUser?.userId && !currentUser?.Id) {
      toast.error("Vui lòng đăng nhập để báo cáo bài viết");
      return;
    }
    setReportModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      toast.warning("Vui lòng nhập lý do báo cáo");
      return;
    }

    setIsReporting(true);
    try {
      await postApi.report({
        postId: post.id,
        description: reportReason,
      });
      toast.success(
        "Báo cáo bài viết thành công. Chúng tôi sẽ xem xét sớm nhất."
      );
      setReportModalVisible(false);
      setReportReason("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Báo cáo thất bại");
    } finally {
      setIsReporting(false);
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
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 p-2 hover:bg-white rounded-lg"
          >
            <ArrowLeft size={18} />
            <span>Quay lại diễn đàn</span>
          </motion.button>
        </Link>

        {/* Main Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
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
                        post.authorName || "User"
                      )}&background=random`
                    }
                    alt={post.authorName}
                    size={48}
                    className="border-2 border-gray-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-900">
                        {post.authorName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={14} />
                      <span>{createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isOwner ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="default"
                        icon={<Edit size={14} />}
                        onClick={() => navigate(`/forum/edit/${post.id}`)}
                        className="rounded-lg border-gray-300 font-medium"
                      >
                        Sửa
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => setDeleteModalVisible(true)}
                        className="rounded-lg font-medium"
                      >
                        Xóa
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <Tooltip title="Báo cáo bài viết">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="default"
                        danger
                        icon={<Flag size={14} />}
                        onClick={handleReportClick}
                        className="rounded-lg font-medium"
                      >
                        Báo cáo
                      </Button>
                    </motion.div>
                  </Tooltip>
                )}
              </div>
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
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 group"
                    >
                      <img
                        src={u}
                        alt={`Post image ${i + 1}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

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

        {/* Report Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-red-500" />
              <span>Báo cáo bài viết</span>
            </div>
          }
          open={reportModalVisible}
          onOk={handleReportSubmit}
          onCancel={() => {
            setReportModalVisible(false);
            setReportReason("");
          }}
          okText="Gửi báo cáo"
          cancelText="Hủy"
          confirmLoading={isReporting}
          okButtonProps={{
            danger: true,
            disabled: !reportReason.trim(),
          }}
          centered
        >
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Vui lòng mô tả lý do bạn muốn báo cáo bài viết này. Chúng tôi sẽ
              xem xét và xử lý trong thời gian sớm nhất.
            </p>
            <Input.TextArea
              placeholder="Ví dụ: Nội dung không phù hợp, spam, vi phạm quy định..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
              className="rounded-lg"
            />
          </div>
        </Modal>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8"
        >
          <CommentSection postId={postId} />
        </motion.div>
      </div>
    </div>
  );
}
