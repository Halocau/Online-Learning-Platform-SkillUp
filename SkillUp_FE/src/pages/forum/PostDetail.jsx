// src/pages/forum/PostDetail.jsx
import React, { useEffect, useState } from "react";
import { postApi } from "@/api/postAPI";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spin, Button, message } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "../../components/forum/CommentSection";
import { Edit, ArrowLeft } from "lucide-react";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

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
        message.error("Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading)
    return (
      <div className="text-center py-12">
        <Spin size="large" />
      </div>
    );
  if (!post)
    return <div className="p-6 bg-white rounded-lg shadow-sm">Post not found</div>;

  const images = post.ImageUrls ?? post.imageUrls ?? [];
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner =
    String(currentUser.id ?? currentUser.Id) ===
    String(post.AccountId ?? post.accountId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              {post.AccountName ?? post.accountName}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {post.Title ?? post.title}
            </h1>
            <div className="text-xs text-gray-400">
              {post.CreatedAt ? new Date(post.CreatedAt).toLocaleString() : ""}
            </div>
          </div>

          <div className="space-x-2">
            {isOwner && (
              <Button
                icon={<Edit size={14} />}
                onClick={() => navigate(`/forum/edit/${post.Id ?? post.id}`)}
              >
                Edit
              </Button>
            )}
            <Link to="/forum">
              <Button icon={<ArrowLeft size={14} />}>Back</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 prose prose-indigo max-w-none text-gray-700 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.Contents ?? post.contents}
          </ReactMarkdown>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {images.map((u, i) => (
              <img
                key={i}
                src={u}
                alt=""
                className="w-full h-56 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition"
              />
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Category:{" "}
          <strong className="text-indigo-600">
            {post.ForumCategoryName ?? post.forumCategoryName}
          </strong>
        </div>
      </div>

      <CommentSection postId={postId} />
    </div>
  );
}