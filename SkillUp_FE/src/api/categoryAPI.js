import axios from "axios";
import { API_BASE_URL as CONFIG_API_BASE_URL } from "@/config/api";

const API_BASE_URL = `${CONFIG_API_BASE_URL}/Category`;

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
