// src/pages/forum/PostDetail.jsx
import React, { useEffect, useState } from "react";
import { postApi } from "@/api/postAPI";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spin, Button, message } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "../../components/forum/CommentSection";

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
       
        postApi
          .getActive()
          .then((res) => {
            const arr = res?.data?.data ?? [];
            const found = arr.find(
              (x) =>
                String(x.Id) === String(postId) ||
                String(x.id) === String(postId)
            );
            setPost(found || null);
          })
          .catch((err) => {
            console.error(err);
            message.error("Failed to load post");
          });
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading)
    return (
      <div className="text-center py-12">
        <Spin />
      </div>
    );
  if (!post) return <div className="p-6 bg-white rounded">Post not found</div>;

  const images = post.PostImageUrls ?? post.postImageUrls ?? [];

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner =
    String(currentUser.id ?? currentUser.Id) ===
    String(post.AccountId ?? post.accountId);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">
              {post.AccountName ?? post.accountName}
            </div>
            <h1 className="text-2xl font-semibold mt-2">
              {post.Title ?? post.title}
            </h1>
            <div className="text-xs text-gray-400 mt-1">
              {post.CreatedAt ? new Date(post.CreatedAt).toLocaleString() : ""}
            </div>
          </div>

          <div className="space-x-2">
            {isOwner && (
              <Button
                onClick={() => navigate(`/forum/edit/${post.Id ?? post.id}`)}
              >
                Edit
              </Button>
            )}
            <Link to="/forum">
              <Button>Back</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 text-gray-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.Contents ?? post.contents}
          </ReactMarkdown>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {images.map((u, i) => (
              <img
                key={i}
                src={u}
                alt=""
                className="w-full h-48 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Category:{" "}
          <strong>{post.ForumCategoryName ?? post.forumCategoryName}</strong>
        </div>
      </div>

      
      <CommentSection postId={postId} />
    </div>
  );
}
