import { jwtDecode } from "jwt-decode";
import { axiosInstance } from "@/config/api";

export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded;
  } catch {
    return null;
  }
};

export const saveUserFromToken = async (accessToken, refreshToken) => {
  const decoded = decodeToken(accessToken);

  if (!decoded) {
    return null;
  }
  console.log("🔍 JWT Decoded:", decoded);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  const user = {
    userId: decoded.userId,
    email: decoded.email,
    fullname: decoded.fullname,
    roleId: decoded.roleId,
    role: decoded.roleName,
    status: decoded.status || decoded.Status || "Active",
    avatar: null,
  };

  try {
    const response = await axiosInstance.get("/user/View-Profile");

    if (response.data.code === 200 && response.data.data.length > 0) {
      user.avatar = response.data.data[0].avatar || null;
    }
  } catch (error) {
    console.error("⚠️ Could not fetch avatar:", error);
  }

  localStorage.setItem("user", JSON.stringify(user));

  return user; // Return the user object
};

export const getRedirectPath = (role) => {
  switch (role) {
    case "Admin":
      return "/admin/";
    case "Content Morderator":
      return "/contentmod/";
    case "System Morderator":
      return "/sysmod/";
    case "Lecturer":
      return "/lecturer/";
    case "Student":
      return "/";
    default:
      return "/";
  }
};
