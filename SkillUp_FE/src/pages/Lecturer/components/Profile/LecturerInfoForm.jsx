import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Building2, CreditCard, User as UserIcon } from 'lucide-react';

function LecturerInfoForm({ lecturerFormData, setLecturerFormData, onSubmit, loading }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLecturerFormData(prev => ({
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
        <CardTitle className="text-2xl font-bold">Thông tin giảng viên</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-yellow-500" />
              Thông tin chuyên môn
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Chức danh
                </Label>
                <Input
                  name="title"
                  type="text"
                  value={lecturerFormData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Giảng viên, Thạc sĩ, Tiến sĩ"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Chuyên môn
                </Label>
                <Input
                  name="profession"
                  type="text"
                  value={lecturerFormData.profession}
                  onChange={handleInputChange}
                  placeholder="VD: Lập trình, Thiết kế, Marketing"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              Thông tin ngân hàng
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  Tên ngân hàng
                </Label>
                <Input
                  name="bankName"
                  type="text"
                  value={lecturerFormData.bankName}
                  onChange={handleInputChange}
                  placeholder="VD: Vietcombank, Techcombank, BIDV"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Số tài khoản
                </Label>
                <Input
                  name="bankNumber"
                  type="text"
                  value={lecturerFormData.bankNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số tài khoản ngân hàng"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  Tên chủ tài khoản
                </Label>
                <Input
                  name="receiverName"
                  type="text"
                  value={lecturerFormData.receiverName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên chủ tài khoản (theo CMND/CCCD)"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
            >
              {loading ? 'Đang lưu...' : 'Cập nhật thông tin giảng viên'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default LecturerInfoForm;