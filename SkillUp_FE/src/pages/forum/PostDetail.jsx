import React, { useEffect, useState } from "react";
import { Card, Spin, message, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${postId}`);
        setPost(res.data);
      } catch {
        message.error("Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!post) return <p>Post not found</p>;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="w-full max-w-4xl shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <Badge variant="outline" className="capitalize">
            {post.category}
          </Badge>
        </div>
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default PostDetail;
