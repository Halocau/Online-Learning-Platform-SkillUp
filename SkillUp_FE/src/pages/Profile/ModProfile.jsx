import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";
import ProfileSidebar from "../Lecturer/components/Profile/ProfileSideBar";
import BasicInfoForm from "../Lecturer/components/Profile/BasicInfoForm";
import PasswordChangeForm from "../Lecturer/components/Profile/PasswordChangeForm";
import { useBasicProfile } from "./useBasicProfile";

function ModProfile() {
  const {
    loading,
    profile,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    updateProfile,
    changePassword,
    uploadAvatar,
  } = useBasicProfile();

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-32"></div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              profile={profile}
              lecturerProfile={null}
              onUploadAvatar={uploadAvatar}
            />
          </div>

          {/* Right Side - Tabbed Forms */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Thông tin cơ bản</span>
                  <span className="sm:hidden">Cơ bản</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Đổi mật khẩu</span>
                  <span className="sm:hidden">Mật khẩu</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <BasicInfoForm
                  profile={profile}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={updateProfile}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="password">
                <PasswordChangeForm
                  passwordData={passwordData}
                  setPasswordData={setPasswordData}
                  onSubmit={changePassword}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModProfile;
