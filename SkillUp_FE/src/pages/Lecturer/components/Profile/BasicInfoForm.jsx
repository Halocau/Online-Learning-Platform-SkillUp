import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Calendar, FileText, User as UserIcon } from 'lucide-react';

function BasicInfoForm({ profile, formData, setFormData, onSubmit, loading }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-2xl font-bold">Thông tin cơ bản</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ...  rest of the form stays the same ... */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-500" />
              Thông tin liên hệ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={profile?. email || ''}
                  disabled
                  className="bg-gray-100 border-gray-200"
                />
              </div>

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

            <div className="mt-4 space-y-2">
              <Label className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ngày sinh
              </Label>
              <Input
                name="dob"
                type="date"
                value={formData. dob}
                onChange={handleInputChange}
                className="border-gray-300"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-500" />
              Tiểu sử
            </h3>
            <textarea
              name="description"
              value={formData. description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Viết một vài dòng giới thiệu về bản thân..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
            >
              {loading ?  'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default BasicInfoForm;