// src/components/forum/PostCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function PostCard({ post }) {
  const title = post.Title ?? post.title;
  const contents = post.Contents ?? post.contents ?? "";
  const preview = contents.length > 180 ? contents.slice(0, 180) + "..." : contents;
  const images = post.PostImageUrls ?? post.postImageUrls ?? [];

  return (
    <div className="bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100 rounded-xl p-5">
      <div className="flex items-start gap-5">
        {/* Comment count */}
        <div className="text-center min-w-[60px]">
          <div className="text-lg font-bold text-indigo-600 flex justify-center items-center gap-1">
            <MessageCircle size={16} /> {post.CommentCount ?? 0}
          </div>
          <div className="text-xs text-gray-400">Bình luận</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Link
            to={`/forum/${post.Id ?? post.id}`}
            className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors duration-200"
          >
            {title}
          </Link>

          <div className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">
            {preview}
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {images.slice(0, 3).map((u, i) => (
                <img
                  key={i}
                  src={u}
                  alt=""
                  className="w-20 h-14 object-cover rounded-md border border-gray-100 hover:opacity-90 transition"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs">
                {post.ForumCategoryName ?? post.forumCategoryName}
              </span>
              <Link
                to={`/forum/user/${post.AccountId ?? post.accountId}`}
                className="text-indigo-600 font-medium hover:underline"
              >
                {post.AccountName ?? post.accountName}
              </Link>
              <span>· {post.CreatedAt ? new Date(post.CreatedAt).toLocaleDateString() : ""}</span>
            </div>

            <Link
              to={`/forum/${post.Id ?? post.id}`}
              className="text-xs text-gray-400 hover:text-indigo-600 transition"
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}