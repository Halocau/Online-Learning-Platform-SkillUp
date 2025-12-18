import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/rag/subtitles`;

// Lấy subtitle của lesson
export const getLessonSubtitle = async (lessonId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/lessons/${lessonId}`);
        if (response.data?.code === 200 && response.data?.data?.length > 0) {
            return response.data.data[0];
        }
        return null;
    } catch (error) {
        console.error("Error getting lesson subtitle:", error);
        return null;
    }
};

// Cập nhật subtitle của lesson
export const updateLessonSubtitle = async (lessonId, subtitleText) => {
    try {
        const response = await axiosInstance.put(
            `${API_URL}/lessons/${lessonId}`,
            subtitleText,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.data?.code === 200) {
            return response.data;
        }
        throw new Error(response.data?.message || "Cập nhật subtitle thất bại");
    } catch (error) {
        console.error("Error updating lesson subtitle:", error);
        throw error;
    }
};

