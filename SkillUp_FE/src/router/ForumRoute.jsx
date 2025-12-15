// src/routes/ForumRoute.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ForumList from "@/pages/forum/ForumList.jsx";

import PostDetail from "@/pages/forum/PostDetail.jsx";
import ForumLayout from "../layouts/ForumLayout.jsx";
import ForumForm from "@/pages/forum/ForumForm.jsx";
import { User } from "lucide-react";
import UserPosts from "@/pages/forum/UserPost";

export default function ForumRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ForumLayout />}>
        <Route index element={<ForumList />} />
        <Route path="create" element={<ForumForm />} />
        <Route path="edit/:postId" element={<ForumForm isEdit />} />
        <Route path=":postId" element={<PostDetail />} />
        <Route path="user/:accountId" element={<UserPosts />} />
      </Route>
    </Routes>
  );
}
