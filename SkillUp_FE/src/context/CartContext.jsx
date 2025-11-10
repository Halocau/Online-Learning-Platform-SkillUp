// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { cartAPI } from "@/api/cartAPI";
import {
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartCount,
} from "@/utils/guestCart";

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

  // Kiểm tra user đã đăng nhập chưa
  const getUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user:", error);
      return null;
    }
  };

  // Fetch cart count từ server (cho user đã đăng nhập)
  const fetchCartCount = async () => {
    try {
      const user = getUser();
      if (!user?.userId) {
        // Nếu chưa đăng nhập, lấy count từ localStorage
        setCartCount(getGuestCartCount());
        return;
      }

      const response = await cartAPI.getCart(user.userId);

      if (response.data.code === 200) {
        const items = response.data.data[0]?.cartItems || [];
        setCartCount(items.length);
      } else if (response.data.code === 404) {
        // Giỏ hàng trống
        setCartCount(0);
      }
    } catch (error) {
      // Nếu lỗi 404, set count = 0
      if (error.response?.status === 404) {
        setCartCount(0);
      } else {
        console.error("Error fetching cart count:", error);
      }
    }
  };

  // Merge guest cart với server cart khi user đăng nhập
  const mergeGuestCartWithServer = async (userId) => {
    try {
      const guestCart = getGuestCart();

      if (guestCart.length === 0) {
        return; // Không có gì để merge
      }

      // Gọi API bulk-add
      const response = await cartAPI.bulkAddToCart(userId, guestCart);

      if (response.data.code === 200) {
        console.log("Guest cart merged successfully:", response.data.data);
        // Xóa guest cart sau khi merge thành công
        clearGuestCart();
        // Cập nhật cart count
        await fetchCartCount();
        return { success: true, message: "Đã đồng bộ giỏ hàng thành công" };
      }
    } catch (error) {
      console.error("Error merging guest cart:", error);
      return { success: false, message: "Lỗi khi đồng bộ giỏ hàng" };
    }
  };

  // Thêm vào giỏ hàng
  const addToCart = async (courseId, price) => {
    try {
      setLoading(true);
      const user = getUser();

      if (!user?.userId) {
        // Nếu chưa đăng nhập, lưu vào localStorage
        const success = addToGuestCart(courseId, price);
        if (success) {
          setCartCount(getGuestCartCount());
          return { success: true, message: "Đã thêm vào giỏ hàng" };
        }
        throw new Error("Không thể thêm vào giỏ hàng");
      }

      // Nếu đã đăng nhập, gọi API
      const response = await cartAPI.addToCart(user.userId, courseId, price);

      if (response.data.code === 200) {
        await fetchCartCount();
        return { success: true, message: "Đã thêm vào giỏ hàng" };
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, message: error.message || "Có lỗi xảy ra" };
    } finally {
      setLoading(false);
    }
  };

  // Xóa khỏi giỏ hàng
  const removeFromCart = async (courseId, cartItemId) => {
    try {
      const user = getUser();

      if (!user?.userId) {
        // Nếu chưa đăng nhập, xóa từ localStorage
        removeFromGuestCart(courseId);
        setCartCount(getGuestCartCount());
        return { success: true };
      }

      // Nếu đã đăng nhập, gọi API
      await cartAPI.removeFromCart(cartItemId);
      await fetchCartCount();
      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
      return { success: false, message: error.message };
    }
  };

  // Load cart count khi mount
  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        addToCart,
        removeFromCart,
        fetchCartCount,
        mergeGuestCartWithServer,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};