import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

function TicketDetail() {
    const { ticketCode } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTicketDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`${API_ENDPOINTS.GET_TICKET}/${ticketCode}`);

            if (response.data.code === 200) {
                setTicket(response.data.data[0]);
            }
        } catch (error) {
            console.error('Error fetching ticket detail:', error);
            toast.error('Không thể tải thông tin ticket');
            navigate('/ticket');
        } finally {
            setLoading(false);
        }
    }, [ticketCode, navigate]);

    useEffect(() => {
        fetchTicketDetail();
    }, [fetchTicketDetail]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) {
            toast.warning('Vui lòng nhập nội dung phản hồi');
            return;
        }

        try {
            setSubmitting(true);
            // Giả sử có API để reply ticket
            await axiosInstance.post(`${API_ENDPOINTS.GET_TICKET}/${ticketCode}/reply`, {
                message: replyMessage
            });

            toast.success('Đã gửi phản hồi thành công');
            setReplyMessage('');
            fetchTicketDetail(); // Reload để lấy reply mới
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Không thể gửi phản hồi');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Hàm getStatusBadge từ code của bạn
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Open': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Mới', icon: '🆕' },
            'InProgress': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Đang xử lý', icon: '⏳' },
            'Resolved': { color: 'bg-green-100 text-green-700 border-green-200', label: 'Đã giải quyết', icon: '✅' },
            'Closed': { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Đã đóng', icon: '🔒' }
        };
        const config = statusConfig[status] || statusConfig['Open'];
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        );
    };

    // Hàm getPriorityBadge từ code của bạn
    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'Low': { color: 'bg-gray-100 text-gray-700', label: 'Thấp' },
            'Medium': { color: 'bg-blue-100 text-blue-700', label: 'Trung bình' },
            'High': { color: 'bg-orange-100 text-orange-700', label: 'Cao' },
            'Critical': { color: 'bg-red-100 text-red-700', label: 'Khẩn cấp' }
        };
        const config = priorityConfig[priority] || priorityConfig['Medium'];
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                        <p className="text-gray-600 text-lg">Đang tải thông tin ticket...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Not Found State
    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy ticket</h2>
                        <p className="text-gray-600 mb-6">Ticket này không tồn tại hoặc đã bị xóa</p>
                        <button
                            onClick={() => navigate('/ticket')}
                            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all"
                        >
                            Quay lại danh sách
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // GIAO DIỆN CHÍNH (ĐÃ THAY THẾ)
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            {/* ======== MAIN CONTENT (GIAO DIỆN MỚI) ======== */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Tiêu đề và nút quay lại */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{ticket.title}</h2>
                        <p className="text-sm text-gray-600">
                            <button
                                onClick={() => navigate('/ticket')}
                                className="text-yellow-500 hover:text-yellow-600 hover:underline font-medium"
                            >
                                My Tickets
                            </button>
                            <span className="mx-2">/</span>
                            <span className="font-medium text-gray-800">#{ticket.ticketCode}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/ticket')}
                        className="px-6 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold rounded-lg transition-all shadow-sm"
                    >
                        ❮ Quay lại
                    </button>
                </div>

                {/* Div bọc layout 3 cột */}
                <div className="flex flex-col lg:flex-row lg:gap-8">

                    {/* CỘT 1: SIDEBAR TĨNH (Nav) */}
                    <aside className="lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Ticket center</h3>
                            <nav className="space-y-2">
                                <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                                    Danh sách
                                </a>
                                <a href="#" className="flex items-center px-4 py-3 font-semibold bg-yellow-400 text-gray-900 rounded-lg shadow-md">
                                    My Tickets
                                </a>
                                <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                                    Assigned to me
                                </a>
                                <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                                    All ticket
                                </a>
                            </nav>
                            <button className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all shadow-sm">
                                <span>➕</span> Tạo ticket
                            </button>
                        </div>
                    </aside>

                    {/* CỘT 2 & 3: NỘI DUNG CHÍNH */}
                    <div className="flex-grow">
                        <div className="flex flex-col-reverse lg:flex-row lg:gap-8">

                            {/* Cột chính (Trái) - Nội dung & Phản hồi */}
                            <div className="flex-grow space-y-6">

                                {/* Nội dung ticket gốc */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{ticket.createdBy || 'Bạn'} đã gửi</span>
                                        <span className="text-sm text-gray-500">{formatDateTime(ticket.createdAt)}</span>
                                    </div>
                                    <div className="p-5 text-gray-700 whitespace-pre-wrap">
                                        {ticket.description}
                                    </div>
                                    {/* Tệp đính kèm */}
                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <div className="border-t border-gray-200 p-5">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tệp đính kèm</h3>
                                            <div className="space-y-2">
                                                {ticket.attachments.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <span className="text-2xl">📎</span>
                                                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tiêu đề Phản hồi */}
                                <h4 className="text-xl font-bold text-gray-900">Phản hồi</h4>

                                {/* Danh sách Phản hồi */}
                                {ticket.replies && ticket.replies.length > 0 ? (
                                    <div className="space-y-4">
                                        {ticket.replies.map((reply, index) => (
                                            <div
                                                key={index}
                                                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${reply.isStaff ? 'border-yellow-200' : ''}`}
                                            >
                                                <div
                                                    className={`px-5 py-4 border-b border-gray-200 flex justify-between items-center ${reply.isStaff ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}
                                                >
                                                    <span className={`font-semibold ${reply.isStaff ? 'text-yellow-600' : 'text-gray-800'}`}>
                                                        {reply.isStaff ? (reply.userName || 'EdA Support') : (reply.userName || 'Bạn')}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{formatDateTime(reply.createdAt)}</span>
                                                </div>
                                                <div className="p-5 text-gray-700 whitespace-pre-wrap">
                                                    {reply.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="text-4xl mb-2">💬</div>
                                        <p className="text-gray-500">Chưa có phản hồi nào</p>
                                    </div>
                                )}

                                {/* Hộp Gửi phản hồi mới */}
                                {ticket.status !== 'Closed' && (
                                    <form onSubmit={handleReply} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Gửi phản hồi mới</h4>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                                            placeholder="Nhập phản hồi của bạn..."
                                            disabled={submitting}
                                        />
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="submit"
                                                disabled={submitting || !replyMessage.trim()}
                                                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Cột phụ (Phải) - Thông tin ticket */}
                            <div className="lg:w-80 flex-shrink-0 mb-6 lg:mb-0">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                                    <h4 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Thông tin ticket</h4>

                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Mã Ticket:</span>
                                            <span className="font-semibold text-gray-900">#{ticket.ticketCode}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Ngày tạo:</span>
                                            <span className="font-semibold text-gray-900 text-right">{formatDateTime(ticket.createdAt)}</span>
                                        </div>

                                        {ticket.updatedAt && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Cập nhật:</span>
                                                <span className="font-semibold text-gray-900 text-right">{formatDateTime(ticket.updatedAt)}</span>
                                            </div>
                                        )}

                                        {ticket.category && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Danh mục:</span>
                                                <span className="font-semibold text-gray-900 text-right">{ticket.category}</span>
                                            </div>
                                        )}

                                        {ticket.priority && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Độ ưu tiên:</span>
                                                {getPriorityBadge(ticket.priority)}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Trạng thái:</span>
                                            {getStatusBadge(ticket.status)}
                                        </div>

                                        {/* Nút Đóng Ticket (bạn có thể thêm logic sau) */}
                                        <button className="w-full mt-4 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all">
                                            Đóng Ticket này
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default TicketDetail;