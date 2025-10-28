import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Heart, Calendar } from "lucide-react";
import { Avatar, Tooltip } from "antd";
import { toast } from "react-toastify";

export default function PostCard({ post }) {
  const title = post.Title ?? post.title;
  const contents = post.Contents ?? post.contents ?? "";
  const preview =
    contents.length > 180 ? contents.slice(0, 180) + "..." : contents;
  const images = post.ImageUrls ?? post.imageUrls ?? [];
  const commentCount = post.CommentCount ?? 0;
  const likeCount = post.LikeCount ?? 0;
  const category = post.CategoryName ?? post.categoryName ?? "Chưa phân loại";
  const avatarUrl =
    post.AccountAvatarUrl ??
    post.accountAvatarUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${
      post.AccountName ?? "student"
    }`;
  const userId = post.AccountId ?? post.accountId;

  return (
    <div className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-2xl p-6 mb-6 hover:-translate-y-[2px]">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Tooltip title={`Xem bài đăng của ${post.AccountName ?? post.accountName}`}>
          <Link
            to={userId ? `/forum/user/${userId}` : "#"}
            onClick={(e) => {
              if (!userId) {
                e.preventDefault();
                toast.error("Không tìm thấy người dùng cho bài viết này!");
              }
            }}
          >
            <Avatar
              src={avatarUrl}
              size={54}
              className="border border-gray-200 cursor-pointer hover:opacity-80"
            />
          </Link>
        </Tooltip>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/forum/${post.Id ?? post.id}`}
            className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors duration-200 leading-snug line-clamp-2"
          >
            {title}
          </Link>

          <div className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
            {preview}
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="post"
                  className="w-24 h-16 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition"
                />
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium text-xs">
                {category}
              </span>
              <Link
                to={`/forum/user/${userId}`}
                className="text-indigo-600 font-medium hover:underline"
              >
                {post.AccountName ?? post.accountName}
              </Link>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar size={12} />
                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 hover:text-pink-500 transition">
                <Heart size={15} />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-indigo-500 transition">
                <MessageCircle size={15} />
                <span>{commentCount}</span>
              </div>
              <Link
                to={`/forum/${post.Id ?? post.id}`}
                className="text-xs text-gray-400 hover:text-indigo-600 transition"
              >
                Chi tiết →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
