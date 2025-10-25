// src/pages/forum/ForumList.jsx
import React, { useEffect, useState } from "react";
import { Button, Spin, Empty, Select } from "antd";
import { Link } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import { categoryApi } from "@/api/forumCategory";
import PostCard from "@/components/forum/PostCard";

export default function ForumList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getActive();
      const arr = res?.data?.data ?? [];
      setPosts(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterCat ? posts.filter(p => String(p.ForumCategoryId ?? p.forumCategoryId) === String(filterCat)) : posts;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 220 }}
            onChange={(val) => setFilterCat(val)}
          >
            {categories.map(c => (
              <Select.Option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                {c.name ?? c.Name}
              </Select.Option>
            ))}
          </Select>
          <Button onClick={fetchPosts}>Refresh</Button>
        </div>

        <Link to="/forum/create">
          <Button type="primary">+ New Post</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><Spin /></div>
      ) : filtered.length === 0 ? (
        <Empty description="No posts yet" />
      ) : (
        <div className="space-y-4">
          {filtered.map(p => <PostCard key={p.Id ?? p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
