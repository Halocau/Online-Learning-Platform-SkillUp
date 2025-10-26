import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { FileText, Calendar, Mail, Phone, Award, Briefcase, ExternalLink } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

function MyApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/LecturerApplication/my-applications');
      
      if (response.data.code === 200) {
        setApplications(response.data.data[0] || []);
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast.error('Không thể tải danh sách đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang chờ duyệt</Badge>;
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đơn ứng tuyển của tôi</h1>
              <p className="text-gray-600 mt-2">Quản lý các đơn ứng tuyển giảng viên</p>
            </div>
            <Button
              onClick={() => navigate('/lecturer/apply-cv')}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            >
              Nộp đơn mới
            </Button>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có đơn ứng tuyển nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa nộp đơn ứng tuyển giảng viên
                </p>
                <Button
                  onClick={() => navigate('/lecturer/apply-cv')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                >
                  Nộp đơn ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <Card key={app.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{app.fullName}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{app.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{app.phone}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(app.status)}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {app.degree && (
                        <div className="flex items-start gap-2">
                          <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Bằng cấp</p>
                            <p className="font-medium">{app.degree}</p>
                          </div>
                        </div>
                      )}
                      
                      {app.major && (
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Chuyên ngành</p>
                            <p className="font-medium">{app.major}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {app.experience && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Kinh nghiệm</p>
                        <p className="text-gray-900">{app.experience}</p>
                      </div>
                    )}

                    {app.introduction && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Giới thiệu</p>
                        <p className="text-gray-900 line-clamp-3">{app.introduction}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                      {app.cvUrl && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(app.cvUrl, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Xem CV
                        </Button>
                      )}
                      
                      {app.status === 'Pending' && (
                        <Button
                          onClick={() => navigate(`/lecturer/application/${app.id}/edit`)}
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                    </div>

                    {app.rejectionReason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-semibold text-red-900 mb-1">Lý do từ chối:</p>
                        <p className="text-sm text-red-800">{app.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyApplications;
