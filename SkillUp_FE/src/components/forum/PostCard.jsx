// src/components/forum/PostCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const title = post.Title ?? post.title;
  const contents = post.Contents ?? post.contents ?? "";
  const preview = contents.length > 180 ? contents.slice(0, 180) + "..." : contents;
  const images = post.PostImageUrls ?? post.postImageUrls ?? [];

  return (
    <div className="bg-white p-5 rounded shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 text-center">
          <div className="text-orange-600 font-bold">{post.CommentCount ?? 0}</div>
          <div className="text-xs text-gray-400">answers</div>
        </div>
        <div className="flex-1">
          <Link to={`/forum/${post.Id ?? post.id}`} className="text-lg font-semibold text-orange-600 hover:underline">
            {title}
          </Link>

          <div className="text-sm text-gray-600 mt-2">
            {preview}
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {images.slice(0, 2).map((u, i) => (
                <img key={i} src={u} alt="" className="w-16 h-12 object-cover rounded" />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {post.ForumCategoryName ?? post.forumCategoryName}
              </span>
              <Link to={`/forum/user/${post.AccountId ?? post.accountId}`} className="text-orange-600 hover:underline">
                {post.AccountName ?? post.accountName}
              </Link>
              <span>· {post.CreatedAt ? new Date(post.CreatedAt).toLocaleDateString() : ""}</span>
            </div>

            <div>
              <Link to={`/forum/${post.Id ?? post.id}`} className="text-xs text-gray-400">View</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
