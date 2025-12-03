import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Heart, Calendar, ArrowRight, Flag } from "lucide-react";
import { Avatar, Tooltip, Modal, Input } from "antd";
import { toast } from "react-toastify";
import { postApi } from "@/api/postAPI";
import { motion } from "framer-motion";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.userId ?? currentUser.Id;

  const title = post.Title ?? post.title;
  const contents = post.Contents ?? post.contents ?? "";
  const preview =
    contents.length > 150 ? contents.slice(0, 150) + "..." : contents;
  const images = post.ImageUrls ?? post.imageUrls ?? [];
  const category = post.CategoryName ?? post.categoryName ?? "Chưa phân loại";
  const avatarUrl =
    post.AccountAvatarUrl ??
    post.accountAvatarUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${
      post.AccountName ?? "student"
    }`;
  const userId = post.AccountId ?? post.accountId;
  const postId = post.Id ?? post.id;

  // Check if current user is the post owner
  const isOwner = String(currentUserId) === String(userId);

  const handleCardClick = () => {
    navigate(`/forum/${postId}`);
  };

  const handleReportClick = (e) => {
    e.stopPropagation();
    if (!currentUserId) {
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
        postId: postId,
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

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-200 cursor-pointer group relative"
      >
        {/* Report Button - Only show for non-owners */}
        {!isOwner && (
          <Tooltip title="Báo cáo bài viết">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReportClick}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-600 text-gray-400 transition-all opacity-0 group-hover:opacity-100"
            >
              <Flag size={16} />
            </motion.button>
          </Tooltip>
        )}

        {/* Image Banner */}
        {images.length > 0 && (
          <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {title}
          </h3>

          {/* Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {preview}
          </p>

          {/* Image Thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {images.slice(0, 3).map((url, i) => (
                <div
                  key={i}
                  className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 group/img"
                >
                  <img
                    src={url}
                    alt="thumbnail"
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
              {images.length > 3 && (
                <div className="w-16 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  +{images.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Author & Meta Info */}
          <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip
                title={`Bài viết của ${post.AccountName ?? post.accountName}`}
              >
                <Link
                  to={userId ? `/forum/user/${userId}` : "#"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!userId) {
                      e.preventDefault();
                      toast.error("Không tìm thấy người dùng!");
                    }
                  }}
                >
                  <Avatar
                    src={avatarUrl}
                    size={32}
                    className="border border-gray-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                  />
                </Link>
              </Tooltip>
              <div className="min-w-0">
                <Link
                  to={userId ? `/forum/user/${userId}` : "#"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!userId) {
                      e.preventDefault();
                      toast.error("Không tìm thấy người dùng!");
                    }
                  }}
                  className="text-sm font-semibold text-gray-800 hover:text-indigo-600 truncate block transition-colors"
                >
                  {post.AccountName ?? post.accountName}
                </Link>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <div
            className="flex items-center gap-2 text-indigo-600 font-semibold text-sm group/btn"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/forum/${postId}`} className="flex items-center gap-2">
              <span>Chi tiết</span>
              <ArrowRight
                size={14}
                className="group-hover/btn:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      </motion.div>

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
            Vui lòng mô tả lý do bạn muốn báo cáo bài viết này. Chúng tôi sẽ xem
            xét và xử lý trong thời gian sớm nhất.
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
    </>
  );
}
