import React, { useEffect, useState } from "react";
import { Card, Button, message, Empty, Typography, Tag } from "antd";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge"; // shadcn
import { Separator } from "@/components/ui/seperator";
import { Tooltip } from "@/components/ui/tooltip";

const { Title, Paragraph } = Typography;

const ForumList = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts");
      setPosts(res.data);
    } catch (err) {
      message.error("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/posts/${id}`);
      message.success("Post deleted");
      fetchPosts();
    } catch {
      message.error("Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Student Forum</Title>
          <Button type="primary" onClick={() => navigate("/forum/create")}>
            + New Post
          </Button>
        </div>

        {posts.length === 0 ? (
          <Empty description="No posts yet" />
        ) : (
          <div className="grid gap-5">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="shadow-md rounded-2xl hover:shadow-xl transition-all"
                  title={
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/forum/${post._id}`}
                        className="text-blue-600 font-semibold text-lg hover:underline"
                      >
                        {post.title}
                      </Link>
                      <Badge variant="outline" className="capitalize">
                        {post.category}
                      </Badge>
                    </div>
                  }
                  actions={[
                    <Tooltip>
                      <Button onClick={() => setEditingId(post._id)}>
                        Edit
                      </Button>
                      {editingId && (
                        <EditPost
                          postId={editingId}
                          visible={Boolean(editingId)}
                          onClose={() => {
                            setEditingId(null);
                            fetchPosts();
                          }}
                        />
                      )}
                    </Tooltip>,
                    <Tooltip>
                      <Button
                        key="delete"
                        danger
                        onClick={() => handleDelete(post._id)}
                      >
                        Delete
                      </Button>
                    </Tooltip>,
                  ]}
                >
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <Separator className="my-3" />
                  <div className="text-sm text-gray-400">
                    Posted by:{" "}
                    <span className="font-medium">
                      {post.authorName || "Unknown"}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumList;
