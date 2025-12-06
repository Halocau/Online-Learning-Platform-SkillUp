import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Phone, Calendar, Briefcase, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';

function ProfileSidebar({ profile, lecturerProfile, onUploadAvatar }) {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (! file.type.startsWith('image/')) {
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
      
      setAvatarLoading(true);
      await onUploadAvatar(file);
      setAvatarLoading(false);
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current. click();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-8">
        {/* Avatar */}
        <div className="text-center">
          <div className="relative inline-block">
            {previewUrl ?  (
              <img 
                src={previewUrl} 
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : profile?. avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.fullname}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-white">
                {profile?. fullname?. charAt(0). toUpperCase() || 'U'}
              </div>
            )}
            
            <button 
              onClick={handleCameraClick}
              className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 shadow-lg transition-all"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
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
          
          {lecturerProfile?. title && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                <Briefcase className="w-3 h-3" />
                {lecturerProfile.title}
              </span>
            </div>
          )}
          
          {profile?.description && (
            <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">
                "{profile.description}"
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Profile Details */}
        <div className="space-y-3 px-2">
          {profile?.phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-sm text-gray-900">{profile. phone}</p>
              </div>
            </div>
          )}

          {lecturerProfile?.profession && (
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Chuyên môn</p>
                <p className="text-sm text-gray-900">{lecturerProfile.profession}</p>
              </div>
            </div>
          )}

          {profile?.gender && (
            <div className="flex items-start gap-2">
              <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="text-sm text-gray-900">
                  {profile.gender === 'Male' ? 'Nam' : profile.gender === 'Female' ?  'Nữ' : 'Khác'}
                </p>
              </div>
            </div>
          )}

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

          <div className="border-t border-gray-200 my-4"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ngày tham gia</span>
            <span className="text-sm text-gray-900 font-medium">
              {profile?.createdAt ?  new Date(profile.createdAt).toLocaleDateString('vi-VN', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric' 
              }) : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileSidebar;