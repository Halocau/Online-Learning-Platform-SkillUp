// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { addToCartUnified, getCartCountUnified, mergeGuestCartToServer } from "@/utils/cartHelpers";

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
      
      // Sử dụng helper để lấy count (tự động phân biệt guest/logged-in)
      const count = await getCartCountUnified(user);
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const addToCart = async (courseId, price) => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      const user = userStr && userStr !== 'null' ? JSON.parse(userStr) : null;
      
      console.log('🛒 Adding to cart - User:', user); // DEBUG
      
      // Sử dụng helper để add (tự động phân biệt guest/logged-in)
      const result = await addToCartUnified(courseId, price, user);
      
      if (result.success) {
        await fetchCartCount();
      }
      
      return result;
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
    <CartContext.Provider value={{ cartCount, addToCart, fetchCartCount, loading, mergeGuestCartToServer }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
