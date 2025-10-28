// src/pages/forum/PostDetail.jsx
import React, { useEffect, useState } from "react";
import { postApi } from "@/api/postAPI";
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { Spin, Button, Dropdown, Menu, Modal } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "@/components/forum/CommentSection";
import { MoreVertical, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
        toast.error("Failed to load post");
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
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">Post not found</div>
    );

  const images = post.imageUrls ?? [];
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner =
    String(currentUser.id ?? currentUser.Id) === String(post.accountId);

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Post",
      content: "Bạn chắc chắn muốn xóa bài viết này?",
      okText: "Xóa bài viết",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          setDeleting(true);
          await postApi.delete(post.id);
          toast.success("Xóa bài viết thành công !");
          navigate("/forum");
        } catch (err) {
          toast.error("Xóa bài viết thất bại");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<Edit size={14} />}
        onClick={() => navigate(`/forum/edit/${post.id}`)}
      >
        Sửa bài viết
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<Trash2 size={14} />}
        danger
        onClick={handleDelete}
      >
        Xóa bài viết
      </Menu.Item>
    </Menu>
  );

  const categoryName = post.categoryName || "Uncategorized";

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={
                  post.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.accountName || "User"
                  )}&background=random`
                }
                alt={post.accountName}
                className="w-10 h-10 rounded-full border border-gray-200"
              />
              <div>
                <div className="font-medium text-gray-800">
                  {post.accountName}
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>
            <div className="text-xs text-gray-400">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button icon={<MoreVertical size={18} />} loading={deleting} />
              </Dropdown>
            )}
            <Link to="/forum">
              <Button icon={<ArrowLeft size={14} />}>Back</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.contents}
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
          Danh mục: <strong className="text-indigo-600">{categoryName}</strong>
        </div>
      </div>

      {/* Comment section (keeps original import reference) */}
      <CommentSection postId={postId} />
    </div>
  );
}
