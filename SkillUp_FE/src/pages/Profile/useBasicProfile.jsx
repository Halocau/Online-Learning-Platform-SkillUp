import { useState, useEffect } from 'react';
import { axiosInstance } from '@/config/api';
import { toast } from 'react-toastify';

export const useBasicProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    gender: '',
    dob: '',
    description: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/user/View-Profile');
      
      if (response.data.code === 200) {
        const profileData = response.data.data[0];
        setProfile(profileData);
        
        setFormData({
          fullname: profileData.fullname || '',
          phone: profileData.phone || '',
          gender: profileData. gender || '',
          dob: profileData.dob ?  profileData.dob.split('T')[0] : '',
          description: profileData.description || ''
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance. put('/user/Edit-profile', formData);
      
      if (response.data.code === 200) {
        toast.success('Cập nhật hồ sơ thành công!');
        await fetchProfile();
        return true;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp');
      return false;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/change-password', passwordData);
      
      if (response.data.code === 200) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        return true;
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
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
      formData.append('avatar', file);
      
      const response = await axiosInstance.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data. code === 200) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        const newAvatarUrl = response.data. data[0].avatarUrl;
        setProfile(prev => ({
          ...prev,
          avatar: newAvatarUrl
        }));
        window.location.reload();
        return true;
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error(error.response?.data?.message || 'Upload ảnh đại diện thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    loading,
    profile,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    updateProfile,
    changePassword,
    uploadAvatar,
  };
};