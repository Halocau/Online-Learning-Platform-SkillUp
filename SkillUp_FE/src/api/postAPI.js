// src/api/postAPI.js
import axios from "axios";
import { id } from "zod/v4/locales";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5120/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const postApi = {
  getActive: () => API.get("/Post/view-active"),
  getUser: (accountId) => API.get(`/Post/user/${accountId}`),
  getById: (postId) => API.get(`/Post/ViewPostById/${postId}`),
  create: (formData) =>
    API.post("/Post/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (postId, formData) =>
    API.put(`/Post/update/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => {
    console.log("Calling delete API with id:", id);
    return API.put(`/Post/delete/${id}`);
  },
};
