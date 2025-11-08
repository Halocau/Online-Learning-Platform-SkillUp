// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "@/config/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) return;

      const response = await axiosInstance.get(`/Cart/${user.id}`);
      if (response.data.code === 200) {
        const items = response.data.data[0]?.cartItems || [];
        setCartCount(items.length);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const addToCart = async (courseId) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        throw new Error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      }

      const response = await axiosInstance.post(
        `/Cart/AddToCart/${user.id}`,
        { courseId }
      );

      if (response.data.code === 200) {
        await fetchCartCount();
        return { success: true, message: "Đã thêm vào giỏ hàng" };
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, fetchCartCount, loading }}>
      {children}
    </CartContext.Provider>
  );
};