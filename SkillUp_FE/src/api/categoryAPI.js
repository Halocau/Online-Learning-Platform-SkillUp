import axios from "axios";

const API_BASE_URL = "http://localhost:5120/api/Category";

export const categoryAPI = {
  getAllCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Get-Only-Category`);
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryWithSubcategories: async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GetWithSub/${categoryId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching category with subcategories:", error);
      throw error;
    }
  },
};
