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
      toast.error("Could not load user's posts");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12">
        <Spin size="large" />
      </div>
    );

  if (!posts.length)
    return (
      <div className="max-w-5xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-semibold mb-3">User Posts</h1>
        <Empty description="No posts found for this user" />
        <Link to="/forum">
          <Button icon={<ArrowLeft size={14} />} className="mt-4">
            Back
          </Button>
        </Link>
      </div>
    );

  // ✅ Get user info from first post
  const userName = posts[0].AccountName ?? posts[0].accountName ?? "User";
  const avatarUrl =
    posts[0].AccountAvatarUrl ??
    posts[0].accountAvatarUrl ??
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${userName}`;

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarUrl}
            size={60}
            className="border border-gray-200"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
            <p className="text-gray-500 text-sm">
              {posts.length} post{posts.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Link to="/forum">
          <Button icon={<ArrowLeft size={14} />}>Back</Button>
        </Link>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.Id ?? p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
