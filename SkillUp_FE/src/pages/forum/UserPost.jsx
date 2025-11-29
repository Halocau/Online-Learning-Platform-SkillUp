import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import PostCard from "@/pages/forum/components/PostCard";
import { Spin, Empty, Button, Avatar, Divider } from "antd";
import { ArrowLeft, FileText, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function UserPosts() {
  const { accountId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      toast.error("ID người dùng không hợp lệ");
      return;
    }
    fetchUserPosts();
  }, [accountId]);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getUser(accountId);
      setPosts(res?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
      toast.error("Không thể tải bài đăng của người dùng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/forum" className="inline-flex mb-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 p-2 hover:bg-white rounded-lg">
              <ArrowLeft size={18} />
              <span>Quay lại diễn đàn</span>
            </button>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mb-4">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không có bài đăng nào
              </h2>
              <p className="text-gray-600">
                Người dùng này chưa đăng bài nào trên diễn đàn
              </p>
            </div>
            <Link to="/forum" className="inline-block mt-6">
              <Button
                type="primary"
                className="rounded-lg bg-indigo-600 border-0 font-medium"
              >
                Xem các bài viết khác
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userName = posts[0].accountName ?? posts[0].AccountName ?? "Người dùng";
  const avatarUrl =
    posts[0].accountAvatarUrl ??
    posts[0].AccountAvatarUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userName}`;

  const totalLikes = posts.reduce(
    (sum, p) => sum + (p.LikeCount ?? p.likeCount ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/forum" className="inline-flex mb-8">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 p-2 hover:bg-white rounded-lg">
            <ArrowLeft size={18} />
            <span>Quay lại diễn đàn</span>
          </button>
        </Link>

        {/* User Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-400"></div>

          {/* User Info */}
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-end gap-4">
                <Avatar
                  src={avatarUrl}
                  size={120}
                  className="border-4 border-white shadow-lg"
                />
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userName}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Thành viên của diễn đàn
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {posts.length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Bài viết</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-3xl font-bold text-pink-500 justify-center">
                    <Heart size={24} />
                    {totalLikes}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Lượt thích</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tất cả bài viết ({posts.length})
          </h2>

          <div className="space-y-4">
            {posts.map((p, i) => (
              <motion.div
                key={p.id ?? p.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <PostCard post={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
