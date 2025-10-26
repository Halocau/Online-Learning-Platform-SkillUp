import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi } from '../../api/postAPI';
import { PostCard } from '@/components/forum/PostCard';
import { Spin, Empty, Button } from 'antd';

export default function UserPosts() {
  const { accountId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postApi.getUserPosts(accountId)
      .then(res => {
        setPosts(res.data.data);
        setLoading(false);
      });
  }, [accountId]);

  if (loading) return <div className="text-center py-12"><Spin /></div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">User Posts</h1>
        <Link to="/forum"><Button>Back</Button></Link>
      </div>
      {posts.length === 0 ? (
        <Empty description="No posts" />
      ) : (
        posts.map(p => <PostCard key={p.Id} post={p} />)
      )}
    </div>
  );
}