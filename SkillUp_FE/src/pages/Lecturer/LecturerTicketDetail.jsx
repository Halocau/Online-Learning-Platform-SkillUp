import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '@/components/Ticket/CreateTicketModal.jsx';
import UpdateTicketModal from '@/components/Ticket/UpdateTicketModal.jsx';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Edit,
    User,
    Calendar,
    Tag,
    MessageSquare,
    Paperclip,
    Plus
} from 'lucide-react';

// Status configuration - moved outside component
const STATUS_CONFIGS = {
    Open: {
        label: 'Mở',
        icon: AlertCircle,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        badgeBg: 'bg-blue-100'
    },
    Pending: {
        label: 'Chờ duyệt',
        icon: Clock,
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
        badgeBg: 'bg-yellow-100'
    },
    InProgress: {
        label: 'Đang xử lý',
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        badgeBg: 'bg-amber-100'
    },
    Accepted: {
        label: 'Đã duyệt',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badgeBg: 'bg-green-100'
    },
    Resolved: {
        label: 'Đã giải quyết',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badgeBg: 'bg-green-100'
    },
    Approved: {
        label: 'Đã duyệt',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badgeBg: 'bg-green-100'
    },
    Closed: {
        label: 'Đã đóng',
        icon: CheckCircle2,
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
        badgeBg: 'bg-gray-100'
    },
    Rejected: {
        label: 'Bị từ chối',
        icon: XCircle,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
        badgeBg: 'bg-red-100'
    },
};

const DEFAULT_STATUS_CONFIG = {
    label: 'Không rõ',
    icon: FileText,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    badgeBg: 'bg-gray-100'
};

function LecturerTicketDetail() {
    const { ticketCode } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    // Memoized canUpdate check
    const canUpdate = useCallback((status) => {
        return !['Accepted', 'Rejected', 'Closed'].includes(status || '');
    }, []);

    const fetchTicketDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${API_ENDPOINTS.GET_TICKET}/${ticketCode}`);
            if (res?.data?.code === 200 && Array.isArray(res.data.data) && res.data.data.length > 0) {
                setTicket(res.data.data[0]);
            } else {
                setTicket(null);
            }
        } catch (err) {
            console.error('Error fetching ticket detail:', err);
            toast.error('Không thể tải thông tin phiếu');
            navigate('/lecturer/ticket');
        } finally {
            setLoading(false);
        }
    }, [ticketCode, navigate]);

    useEffect(() => {
        fetchTicketDetail();
    }, [fetchTicketDetail]);

    const handleCreateSuccess = useCallback(() => {
        setIsModalOpen(false);
        toast.success('Tạo phiếu mới thành công!');
        navigate('/lecturer/ticket');
    }, [navigate]);

    const handleUpdateSuccess = useCallback(() => {
        setIsUpdateOpen(false);
        fetchTicketDetail();
        toast.success('Cập nhật phiếu thành công!');
    }, [fetchTicketDetail]);

    // Memoized format date function
    const formatDateTime = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    // Memoized status config getter
    const getStatusConfig = useCallback((status) => {
        return STATUS_CONFIGS[status] || DEFAULT_STATUS_CONFIG;
    }, []);

    // Memoized ticket data
    const ticketData = useMemo(() => {
        if (!ticket) return null;

        const statusConfig = getStatusConfig(ticket.status);
        const StatusIcon = statusConfig.icon;
        const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : [];
        const canEdit = canUpdate(ticket.status);

        return {
            ...ticket,
            statusConfig,
            StatusIcon,
            attachments,
            canEdit,
        };
    }, [ticket, getStatusConfig, canUpdate]);

    // Loading skeleton
    if (loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-64 bg-white rounded-xl border border-gray-200" />
                            <div className="h-48 bg-white rounded-xl border border-gray-200" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-80 bg-white rounded-xl border border-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!ticket || !ticketData) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mx-auto max-w-xl p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy phiếu hỗ trợ</h2>
                    <p className="text-gray-600 mb-6">Phiếu này không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => navigate('/lecturer/ticket')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const { statusConfig, StatusIcon, attachments, canEdit } = ticketData;

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/lecturer/ticket')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Quay lại danh sách</span>
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 ${statusConfig.bg} rounded-xl flex items-center justify-center`}>
                                    <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">
                                        {ticket.title}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Tạo lúc {formatDateTime(ticket.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                                <span className="font-semibold">{statusConfig.label}</span>
                            </span>
                        </div>
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => setIsUpdateOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa phiếu
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{ticket.accountName || 'Bạn'}</p>
                                        <p className="text-xs text-gray-500">Người gửi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">#{ticket.ticketCode}</p>
                                    <p className="text-xs text-gray-500">Mã phiếu</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="prose max-w-none">
                                <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                                    {ticket.contents}
                                </div>
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Paperclip className="w-4 h-4" />
                                        Tệp đính kèm ({attachments.length})
                                    </h4>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {attachments.map((file, i) => (
                                            <a
                                                key={i}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                                                    <Paperclip className="w-5 h-5 text-blue-600 group-hover:text-yellow-600" />
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium truncate flex-1">
                                                    {file.name || file.url}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-yellow-700" />
                                <h3 className="text-lg font-semibold text-gray-900">Phản hồi từ hỗ trợ</h3>
                            </div>
                        </div>

                        {ticket.response ? (
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-gray-900">Đội ngũ hỗ trợ</span>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                Hỗ trợ viên
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {formatDateTime(ticket.updatedAt || ticket.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                                        {ticket.response}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">Chưa có phản hồi</p>
                                <p className="text-sm text-gray-500 mt-1">Đội ngũ hỗ trợ sẽ phản hồi sớm nhất có thể</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-yellow-600" />
                            Thông tin phiếu
                        </h4>
                        <dl className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <dt className="text-sm text-gray-600 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Mã phiếu
                                </dt>
                                <dd className="font-semibold text-gray-900">#{ticket.ticketCode}</dd>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <dt className="text-sm text-gray-600 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Trạng thái
                                </dt>
                                <dd>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                        {statusConfig.label}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <dt className="text-sm text-gray-600 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Ngày tạo
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 text-right">
                                    {formatDateTime(ticket.createdAt)}
                                </dd>
                            </div>
                            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Cập nhật
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900 text-right">
                                        {formatDateTime(ticket.updatedAt)}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        {canEdit && (
                            <button
                                onClick={() => setIsUpdateOpen(true)}
                                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Chỉnh sửa phiếu
                            </button>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 text-gray-700 hover:text-gray-900 rounded-lg transition-all text-left"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo phiếu mới
                            </button>
                            <button
                                onClick={() => navigate('/lecturer/ticket')}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-all text-left"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Về danh sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <UpdateTicketModal
                isOpen={isUpdateOpen && canEdit}
                onClose={() => setIsUpdateOpen(false)}
                onSuccess={handleUpdateSuccess}
                ticket={ticket}
            />
        </div>
    );
}

export default LecturerTicketDetail;
