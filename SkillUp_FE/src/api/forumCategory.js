// src/api/forumCategory.js
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const categoryApi = {
  getAll: () => API.get("/ForumCategory/get-all"),
};
