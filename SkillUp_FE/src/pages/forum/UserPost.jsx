import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import PostCard from "@/components/forum/PostCard";
import { Spin, Empty, Button, Avatar } from "antd";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

export default function UserPosts() {
  const { accountId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      toast.error("Invalid user ID");
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
      console.error("❌ Failed to fetch user posts:", err);
      toast.error("Không thể tải bài đăng của người dùng");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" />
      </div>
    );

  if (!posts.length)
    return (
      <div className="max-w-5xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold mb-3">Bài đăng của người dùng</h1>
        <Empty description="Không có bài đăng nào" />
        <Link to="/forum">
          <Button icon={<ArrowLeft size={14} />} className="mt-4">
            Quay lại diễn đàn
          </Button>
        </Link>
      </div>
    );

  const userName = posts[0].accountName ?? posts[0].AccountName ?? "User";
  const avatarUrl =
    posts[0].accountAvatarUrl ??
    posts[0].AccountAvatarUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userName}`;

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* User header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} size={64} className="border border-gray-200" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
            <p className="text-gray-500 text-sm">
              {posts.length} bài đăng
            </p>
          </div>
        </div>
        <Link to="/forum">
          <Button icon={<ArrowLeft size={14} />}>Quay lại diễn đàn</Button>
        </Link>
      </div>

      {/* Posts */}
      <div className="space-y-5">
        {posts.map((p) => (
          <PostCard key={p.id ?? p.Id} post={p} />
        ))}
      </div>
    </div>
  );
}
