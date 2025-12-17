import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/config/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import {
  FileText,
  Calendar,
  Mail,
  Phone,
  Award,
  Briefcase,
  Eye,
  Image as ImageIcon,
  X,
} from "lucide-react";

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [viewDialog, setViewDialog] = useState({ open: false, url: null, type: null });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axiosInstance.get(
        "/LecturerApplication/my-applications"
      );

      if (response.data.code === 200) {
        // API trả về data là array lồng 2 lần [[{...}]]
        const rawData = response.data.data[0] || [];

        // Map API fields sang component fields
        const mappedApplications = rawData.map(app => ({
          id: app.id,
          cvUrl: app.cv,
          degree: app.degree ? app.degree.split(',')[0] : null, // Lấy ảnh đầu tiên
          degreeImages: app.degree ? app.degree.split(',') : [], // Tất cả ảnh bằng cấp
          fullName: app.title || 'N/A',
          major: app.profession || 'N/A',
          experience: app.description || 'Không có thông tin',
          introduction: null, // API không có field này
          email: null, // API không có field này
          phone: null, // API không có field này
          status: app.status,
          rejectionReason: app.rejectReason,
          submittedDate: app.createdAt,
          reviewDate: app.updatedAt,
          appliedDate: app.createdAt
        }));

        setApplications(mappedApplications);
      }
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error("Không thể tải danh sách đơn ứng tuyển");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Đang chờ duyệt
          </Badge>
        );
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đã duyệt</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewFile = (url, type) => {
    setViewDialog({ open: true, url, type });
  };

  const closeViewDialog = () => {
    setViewDialog({ open: false, url: null, type: null });
  };

  // Chỉ cho phép hiển thị nút "Nộp đơn mới" / "Nộp đơn ngay" khi:
  // - Chưa có đơn nào
  // - Hoặc đơn mới nhất có status = "Rejected"
  const latestStatus = applications[0]?.status;
  const canCreateNew =
    applications.length === 0 || latestStatus === "Rejected";

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Đơn ứng tuyển của tôi
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý các đơn ứng tuyển giảng viên
              </p>
            </div>
            {canCreateNew && (
              <Button
                onClick={() => navigate("/lecturer/apply-cv")}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              >
                Nộp đơn mới
              </Button>
            )}
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
                {canCreateNew && (
                  <Button
                    onClick={() => navigate("/lecturer/apply-cv")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                  >
                    Nộp đơn ngay
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <Card
                  key={app.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-400"
                >
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-3 text-gray-900">
                            {app.fullName}
                          </CardTitle>
                          <CardDescription className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase className="w-4 h-4" />
                              <span>Chuyên môn: {app.major}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Nộp ngày: {new Date(app.submittedDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    {app.experience && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Mô tả / Kinh nghiệm
                        </p>
                        <p className="text-gray-900">{app.experience}</p>
                      </div>
                    )}

                    {app.degreeImages && app.degreeImages.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Ảnh bằng cấp ({app.degreeImages.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {app.degreeImages.map((img, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(img, 'image')}
                              className="gap-2 hover:bg-yellow-100"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Ảnh {idx + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.rejectionReason && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <p className="text-sm font-semibold text-red-900 mb-2">
                          Lý do từ chối:
                        </p>
                        <p className="text-sm text-red-800">
                          {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-6 border-t">
                      {app.cvUrl && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewFile(app.cvUrl, "pdf")}
                          className="flex-1 gap-2 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Xem CV
                        </Button>
                      )}

                      {/* {app.status === "Pending" && (
                        <Button
                          onClick={() =>
                            navigate(`/lecturer/application/${app.id}/edit`)
                          }
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                        >
                          Chỉnh sửa
                        </Button>
                      )} */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Viewer Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={closeViewDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {viewDialog.type === 'pdf' ? (
                <>
                  <FileText className="w-5 h-5 text-red-600" />
                  <span>Xem CV</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>Xem bằng cấp</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full h-[calc(95vh-80px)] overflow-auto">
            {viewDialog.type === 'pdf' ? (
              <iframe
                src={viewDialog.url}
                className="w-full h-full border-0"
                title="CV Preview"
              />
            ) : (
              <div className="flex items-center justify-center min-h-full p-4 bg-gray-100">
                <img
                  src={viewDialog.url}
                  alt="Bằng cấp"
                  className="max-w-full h-auto object-contain shadow-2xl rounded-lg"
                  style={{ maxHeight: 'calc(95vh - 120px)' }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyApplications;
