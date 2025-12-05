import { useState, useEffect } from "react";
import { axiosInstance } from "@/config/api";
import { lecturerAPI } from "@/api/lecturerAPI";
import { toast } from "react-toastify";

export const useProfileData = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [lecturerProfile, setLecturerProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    dob: "",
    description: "",
  });

  const [lecturerFormData, setLecturerFormData] = useState({
    title: "",
    profession: "",
    bankNumber: "",
    bankName: "",
    receiverName: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Fetch both profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true);

      // Fetch basic profile
      const basicResponse = await axiosInstance.get("/user/View-Profile");

      if (basicResponse.data.code === 200) {
        const profileData = basicResponse.data.data[0];
        setProfile(profileData);

        // Set basic form data
        setFormData({
          fullname: profileData.fullname || "",
          phone: profileData.phone || "",
          gender: profileData.gender || "",
          dob: profileData.dob ? profileData.dob.split("T")[0] : "",
          description: profileData.description || "",
        });

        // Fetch lecturer profile using accountId
        const accountId = profileData.id;

        if (accountId) {
          try {
            const lecturerResponse =
              await lecturerAPI.getLecturerProfileByAccount(accountId);

            if (
              lecturerResponse.data.code === 200 &&
              lecturerResponse.data.data &&
              lecturerResponse.data.data.length > 0
            ) {
              const lecturerData = lecturerResponse.data.data[0];
              setLecturerProfile(lecturerData);

              // Set lecturer form data
              setLecturerFormData({
                title: lecturerData.title || "",
                profession: lecturerData.profession || "",
                bankNumber: lecturerData.bankNumber || "",
                bankName: lecturerData.bankName || "",
                receiverName: lecturerData.receiverName || "",
              });
            } else {
              // Initialize empty form if no data exists
              setLecturerFormData({
                title: "",
                profession: "",
                bankNumber: "",
                bankName: "",
                receiverName: "",
              });
            }
          } catch (lecturerError) {
            console.error("Error fetching lecturer profile:", lecturerError);
            // Don't show error toast - lecturer might not have profile yet
            // Initialize empty form
            setLecturerFormData({
              title: "",
              profession: "",
              bankNumber: "",
              bankName: "",
              receiverName: "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin hồ sơ"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update basic profile
  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put("/user/Edit-profile", formData);

      if (response.data.code === 200) {
        toast.success("Cập nhật hồ sơ thành công!");
        await fetchProfiles();
        return true;
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update lecturer profile
  const updateLecturerProfile = async () => {
    try {
      setLoading(true);

      const response = await lecturerAPI.updateLecturerProfile(
        lecturerFormData
      );

      if (response.data.code === 200) {
        toast.success("Cập nhật thông tin giảng viên thành công! ");
        await fetchProfiles();
        return true;
      }
    } catch (error) {
      console.error("Update lecturer profile error:", error);
      toast.error(
        error.response?.data?.message ||
          "Cập nhật thông tin giảng viên thất bại"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("Mật khẩu mới và mật khẩu xác nhận không khớp");
      return false;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/auth/change-password",
        passwordData
      );

      if (response.data.code === 200) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        return true;
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosInstance.post(
        "/user/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200) {
        toast.success("Cập nhật ảnh đại diện thành công!");
        const newAvatarUrl = response.data.data[0].avatarUrl;
        setProfile((prev) => ({
          ...prev,
          avatar: newAvatarUrl,
        }));
        window.location.reload();
        return true;
      }
    } catch (error) {
      console.error("Upload avatar error:", error);
      toast.error(
        error.response?.data?.message || "Upload ảnh đại diện thất bại"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    loading,
    profile,
    lecturerProfile,
    formData,
    setFormData,
    lecturerFormData,
    setLecturerFormData,
    passwordData,
    setPasswordData,
    updateProfile,
    updateLecturerProfile,
    changePassword,
    uploadAvatar,
  };
};
