// src/routes/ForumRoute.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ForumList from "@/pages/forum/ForumList";

import PostDetail from "@/pages/forum/PostDetail";
import ForumLayout from "@/layouts/ForumLayout";
import ForumForm from "@/pages/forum/ForumForm";

export default function ForumRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ForumLayout />}>
        <Route index element={<ForumList />} />
        <Route path="create" element={<ForumForm />} />
        <Route path="edit/:postId" element={<ForumForm isEdit />} />
        <Route path=":postId" element={<PostDetail />} />
      </Route>
    </Routes>
  );
}
