import { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Camera, Mail, Phone, Calendar, FileText, User as UserIcon } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Lock } from 'lucide-react';
function MyProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    gender: '',
    dob: '',
    description: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Avatar upload states
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  // Lấy thông tin profile khi component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Gọi API lấy profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/user/View-Profile');
      
      if (response.data.code === 200) {
        const profileData = response.data.data[0];
        setProfile(profileData);
        
        // Set dữ liệu vào form (khớp với backend DTO)
        setFormData({
          fullname: profileData.fullname || '',
          phone: profileData.phone || '',
          gender: profileData.gender || '',
          dob: profileData.dob ? profileData.dob.split('T')[0] : '',
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

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // xử lý thay đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý submit form đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordLoading(true);
    try {
    
      const response = await axiosInstance.post('/auth/change-password', passwordData);
      
      if (response.data.code === 200) {
        toast.success('Đổi mật khẩu thành công!');
        // Reset form
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };
  // Xử lý cập nhật profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await axiosInstance.put('/user/Edit-profile', formData);
      
      if (response.data.code === 200) {
        toast.success('Cập nhật hồ sơ thành công!');
        fetchProfile(); // Reload profile
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn file avatar
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }    
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      } 
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await handleUploadAvatar(file);
    }
  };

  // Xử lý upload avatar
  const handleUploadAvatar = async (file = selectedFile) => {
    if (!file) {
      toast.error('Vui lòng chọn ảnh để upload');
      return;
    }

    try {
      setAvatarLoading(true);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axiosInstance.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.code === 200) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        
        const newAvatarUrl = response.data.data[0].avatarUrl;
        setProfile(prev => ({
          ...prev,
          avatar: newAvatarUrl
        }));
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        window.location.reload();
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error(error.response?.data?.message || 'Upload ảnh đại diện thất bại');
      
      // Reset states on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setAvatarLoading(false);
    }
  };


  // Xử lý click camera button
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header với màu vàng */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-32"></div>
        
        <div className="max-w-6xl mx-auto px-4 -mt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardContent className="pt-8">
                {/* Avatar */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.fullname}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white">
                        {profile?.fullname?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Camera Icon */}
                    <button 
                      onClick={handleCameraClick}
                      className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 shadow-lg transition-all"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Loading indicator */}
                  {avatarLoading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        Đang cập nhật ảnh đại diện...
                      </div>
                    </div>
                  )}
                  
                  <h2 className="mt-4 text-xl font-bold text-gray-900">{profile?.fullname || 'User'}</h2>
                  <p className="text-sm text-gray-500 mt-1">{profile?.email || 'email@example.com'}</p>
                  
                  {/* Bio */}
                  {profile?.description && (
                    <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 italic">
                        "{profile.description}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Profile Details */}
                <div className="space-y-3 px-2">
                  {/* Phone */}
                  {profile?.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="text-sm text-gray-900">{profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {profile?.gender && (
                    <div className="flex items-start gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Giới tính</p>
                        <p className="text-sm text-gray-900">
                          {profile.gender === 'Male' ? 'Nam' : profile.gender === 'Female' ? 'Nữ' : 'Khác'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {profile?.dob && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Ngày sinh</p>
                        <p className="text-sm text-gray-900">
                          {new Date(profile.dob).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Created At */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ngày tham gia</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { 
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings Card */}
            <Card className="shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-2xl font-bold">Cài đặt hồ sơ</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Contact Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-yellow-500" />
                      Thông tin liên hệ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email - Readonly */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="bg-gray-100 border-gray-200"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Số điện thoại
                        </Label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    {/* Fullname */}
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm text-gray-600 flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="fullname"
                        type="text"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        required
                        className="border-gray-300"
                      />
                    </div>

                    {/* Gender */}
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm text-gray-600">Giới tính</Label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ngày sinh
                      </Label>
                      <Input
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-yellow-500" />
                      Tiểu sử
                    </h3>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Viết một vài dòng giới thiệu về bản thân..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
                    >
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-2xl font-bold">Đổi mật khẩu</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleChangePassword} className="space-y-6">
                {/* Mật khẩu cũ */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Mật khẩu cũ
                  </Label>
                  <Input
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu cũ của bạn"
                    required
                    className="border-gray-300"
                  />
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Mật khẩu mới
                  </Label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    required
                    className="border-gray-300"
                  />
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Xác nhận mật khẩu mới
                  </Label>
                  <Input
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="border-gray-300"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
                  >
                    {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}

export default MyProfile;
