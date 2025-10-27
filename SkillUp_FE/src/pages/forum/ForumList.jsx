// src/pages/forum/ForumList.jsx
import React, { useEffect, useState } from "react";
import { Button, Spin, Empty, Select } from "antd";
import { Link } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import { categoryApi } from "@/api/forumCategory";
import PostCard from "@/components/forum/PostCard";
import { PlusCircle, RefreshCcw } from "lucide-react";

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
      setCategories(
        (res.data.data || []).filter((c) => c.IsActive ?? c.isActive)
      );
      console.log("Categories:", res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getActive();
      setPosts(res?.data?.data ?? []);
      console.log("Posts:", res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterCat
    ? posts.filter((p) => {
        const catName =
          p.ForumCategoryName ??
          p.forumCategoryName ??
          p.ForumCategoryId?.name ??
          p.forumCategoryId?.name;
        return catName?.toLowerCase() === filterCat?.toLowerCase();
      })
    : posts;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 220 }}
            value={filterCat ?? undefined}
            onChange={(val) => setFilterCat(val || null)}
          >
            {categories.map((c, i) => (
              <Select.Option key={c.name} value={c.name}>
                {c.name}
              </Select.Option>
            ))}
          </Select>

          <Button
            icon={<RefreshCcw size={16} />}
            onClick={() => {
              setFilterCat(null);
              fetchPosts();
            }}
            className="border-gray-300"
          >
            Refresh
          </Button>
        </div>

        <Link to="/forum/create">
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0 text-white font-medium rounded-lg shadow-sm hover:opacity-90"
          >
            Create Post
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty description="No posts found" />
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <PostCard key={p.Id ?? p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
