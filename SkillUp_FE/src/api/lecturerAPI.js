import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Lecturer";
const LECTURER_APP_URL = "/LecturerApplication";

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

  // Get lecturer application profile by account ID
  getLecturerProfileByAccount: async (accountId) => {
    try {
      const response = await axiosInstance.get(
        `${LECTURER_APP_URL}/profile-by-account/${accountId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching lecturer application profile:", error);
      throw error;
    }
  },

  // Update lecturer profile
  updateLecturerProfile: async (data) => {
    try {
      const response = await axiosInstance.put(
        `${LECTURER_APP_URL}/profile`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating lecturer profile:", error);
      throw error;
    }
  },
};
