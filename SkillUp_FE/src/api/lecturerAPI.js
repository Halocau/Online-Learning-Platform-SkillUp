import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Lecturer";

export const lecturerAPI = {
  // Get lecturer public profile
  getLecturerPublicProfile: async (accountId) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/profile/${accountId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching lecturer profile:", error);
      throw error;
    }
  },
};
