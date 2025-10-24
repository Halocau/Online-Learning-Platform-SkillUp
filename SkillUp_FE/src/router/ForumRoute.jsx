// src/router/ForumRoutes.jsx
import CreatePost from "@/pages/forum/CreatePost";
import EditPost from "@/pages/forum/EditPost";
import ForumList from "@/pages/forum/ForumList";
import PostDetail from "@/pages/forum/PostDetail";
import { Routes, Route } from "react-router-dom";

const ForumRoutes = () => {
  return (
    <Routes>
      <Route index element={<ForumList />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/edit/:postId" element={<EditPost />} />
      <Route path="/:postId" element={<PostDetail />} />
    </Routes>
  );
};

export default ForumRoutes;
