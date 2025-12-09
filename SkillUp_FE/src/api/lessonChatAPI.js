import axiosInstance from "@/lib/axios";

export const lessonChatAPI = {
    askLesson: async (lessonId, question) => {
        const response = await axiosInstance.post(
            `/lessons/${lessonId}/chat`,
            { question }
        );
        return response;
    },
};

