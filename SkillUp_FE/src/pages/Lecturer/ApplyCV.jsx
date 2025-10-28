import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Upload, FileText, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

function ApplyCV() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    profession: '',
    description: '',
    cvFile: null,
    degreeFile: null
  });

  // Kiểm tra xem đã có đơn ứng tuyển chưa
  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
      setCheckingStatus(true);
      const response = await axiosInstance.get('/LecturerApplication/my-applications');
      
      if (response.data.code === 200 && response.data.data[0]?.length > 0) {
        // Đã có đơn ứng tuyển
        setHasApplication(true);
      }
    } catch (error) {
      console.error('Check application error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      if (name === 'cvFile') {
        // CV chỉ chấp nhận PDF
        if (file.type !== 'application/pdf') {
          toast.error('CV chỉ chấp nhận file PDF!');
          e.target.value = '';
          return;
        }
      } else if (name === 'degreeFile') {
        // Bằng cấp chấp nhận ảnh (JPG, PNG, JPEG)
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validImageTypes.includes(file.type)) {
          toast.error('Bằng cấp chỉ chấp nhận file ảnh (JPG, PNG)!');
          e.target.value = '';
          return;
        }
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File không được vượt quá 5MB!');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.profession || !formData.cvFile || !formData.degreeFile) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append('Title', formData.title);
      submitData.append('Profession', formData.profession);
      submitData.append('Description', formData.description || '');
      submitData.append('CvFile', formData.cvFile);
      submitData.append('DegreeFile', formData.degreeFile);

      const response = await axiosInstance.post('/LecturerApplication/apply', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 200) {
        toast.success('Nộp CV thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
        setHasApplication(true);
        // Ở lại trang này để hiển thị trạng thái đã nộp đơn
      }
    } catch (error) {
      console.error('Apply CV error:', error);
      toast.error(error.response?.data?.message || 'Không thể nộp CV. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Đang kiểm tra...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (hasApplication) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-600">
                Đơn ứng tuyển đã được gửi!
              </CardTitle>
              <CardDescription className="text-lg">
                Chúng tôi đã nhận được CV của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4 text-lg">Các bước tiếp theo:</h3>
                <ol className="list-decimal list-inside space-y-2 text-left text-blue-800">
                  <li>Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng 3-5 ngày làm việc</li>
                  <li>Bạn sẽ nhận được email thông báo kết quả</li>
                  <li>Nếu được chấp nhận, bạn sẽ được cấp quyền giảng viên</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                >
                  Về trang chủ
                </Button>
                <Button 
                  onClick={() => navigate('/lecturer/applications')}
                  variant="outline"
                  className="flex-1"
                >
                  Xem đơn của tôi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-yellow-100 rounded-full mb-4">
              <GraduationCap className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Trở thành giảng viên SkillUp</h1>
            <p className="text-lg text-gray-600">
              Chia sẻ kiến thức và truyền cảm hứng cho hàng ngàn học viên
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Thu nhập hấp dẫn</h3>
                <p className="text-sm text-gray-600">Nhận % từ mỗi khóa học bán được</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Xây dựng thương hiệu</h3>
                <p className="text-sm text-gray-600">Trở thành chuyên gia trong lĩnh vực</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <GraduationCap className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Linh hoạt thời gian</h3>
                <p className="text-sm text-gray-600">Giảng dạy theo lịch của bạn</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Đơn ứng tuyển giảng viên</CardTitle>
              <CardDescription>
                Vui lòng điền đầy đủ thông tin để chúng tôi xem xét
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-yellow-500" />
                    Thông tin chuyên môn
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Chức danh <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="VD: Senior Developer, Marketing Expert, ..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">
                        Chuyên môn <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        placeholder="VD: Web Development, Digital Marketing, ..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả kinh nghiệm</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="Kể về bản thân, kinh nghiệm làm việc, thành tích, lý do muốn trở thành giảng viên..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-yellow-500" />
                    Tải lên CV <span className="text-red-500">*</span>
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
                    <input
                      type="file"
                      id="cvFile"
                      name="cvFile"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="cvFile" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      {formData.cvFile ? (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {formData.cvFile.name}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-1">
                            Click để tải lên CV (PDF)
                          </p>
                          <p className="text-xs text-gray-500">
                            Tối đa 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Degree Upload */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-yellow-500" />
                    Tải lên ảnh bằng cấp <span className="text-red-500">*</span>
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
                    <input
                      type="file"
                      id="degreeFile"
                      name="degreeFile"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="degreeFile" className="cursor-pointer">
                      <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      {formData.degreeFile ? (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {formData.degreeFile.name}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-1">
                            Click để tải lên ảnh bằng cấp (JPG, PNG)
                          </p>
                          <p className="text-xs text-gray-500">
                            Tối đa 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Nộp đơn ứng tuyển
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ApplyCV;
