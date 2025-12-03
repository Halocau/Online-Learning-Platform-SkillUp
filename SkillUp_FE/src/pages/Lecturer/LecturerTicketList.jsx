import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '@/components/Ticket/CreateTicketModal';
import { jwtDecode } from 'jwt-decode';
import {
    Plus,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

const PAGE_SIZE = 3;

// Status configuration - moved outside component to prevent recreation
const STATUS_CONFIGS = {
    Open: {
        label: 'Mở',
        icon: AlertCircle,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
    },
    Pending: {
        label: 'Chờ duyệt',
        icon: Clock,
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
    },
    InProgress: {
        label: 'Đang xử lý',
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
    },
    Accepted: {
        label: 'Đã duyệt',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
    },
    Resolved: {
        label: 'Đã giải quyết',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
    },
    Approved: {
        label: 'Đã duyệt',
        icon: CheckCircle2,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
    },
    Closed: {
        label: 'Đã đóng',
        icon: CheckCircle2,
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500'
    },
    Rejected: {
        label: 'Bị từ chối',
        icon: XCircle,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500'
    },
};

const DEFAULT_STATUS_CONFIG = {
    label: 'Không rõ',
    icon: FileText,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500'
};

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function LecturerTicketList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [allTickets, setAllTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Parse tab from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const qTab = (params.get('tab') || '').toLowerCase();
        const valid = ['all', 'approved', 'rejected', 'pending'];
        setActiveTab(valid.includes(qTab) ? qTab : 'all');
    }, [location.search]);

    // Memoized filter function
    const filterByTab = useCallback((items, tab) => {
        if (!Array.isArray(items)) return [];
        switch (tab) {
            case 'approved':
                return items.filter(t =>
                    ['Accepted', 'Approved', 'Resolved', 'Closed'].includes(t?.status)
                );
            case 'rejected':
                return items.filter(t => t?.status === 'Rejected');
            case 'pending':
                return items.filter(t =>
                    ['Open', 'Pending', 'InProgress'].includes(t?.status)
                );
            default:
                return items;
        }
    }, []);

    // Memoized user ID getter
    const getCurrentUserId = useCallback(() => {
        try {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            if (parsed?.userId) return parsed.userId;

            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                const decoded = jwtDecode(accessToken);
                if (decoded?.userId) return decoded.userId;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
        return null;
    }, []);

    // Fetch tickets
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const accountId = getCurrentUserId();
                if (!accountId) {
                    toast.error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
                    setAllTickets([]);
                    return;
                }

                const endpoint = API_ENDPOINTS.ACCOUNT_TICKETS.replace('{accountId}', accountId);
                const response = await axiosInstance.get(endpoint);

                if (response.data?.code === 200) {
                    const raw = response.data.data?.[0] || [];
                    const sorted = [...raw].sort((a, b) => {
                        const ta = new Date(a.createdAt).getTime();
                        const tb = new Date(b.createdAt).getTime();
                        return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
                    });
                    setAllTickets(sorted);
                }
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [refetchTrigger, getCurrentUserId]);

    // Memoized filtered tickets
    const filteredTickets = useMemo(() => {
        let filtered = filterByTab(allTickets, activeTab);

        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(ticket =>
                ticket.title?.toLowerCase().includes(query) ||
                ticket.contents?.toLowerCase().includes(query) ||
                ticket.ticketCode?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [allTickets, activeTab, filterByTab, debouncedSearchQuery]);

    // Memoized pagination
    const totalPages = useMemo(() => {
        return Math.ceil(filteredTickets.length / PAGE_SIZE) || 1;
    }, [filteredTickets.length]);

    const displayedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return filteredTickets.slice(startIndex, endIndex);
    }, [currentPage, filteredTickets]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, debouncedSearchQuery]);

    const handleCreateSuccess = useCallback((newTicket) => {
        setIsModalOpen(false);
        setRefetchTrigger(prev => prev + 1);
        if (newTicket) {
            const withCreatedAt = {
                createdAt: newTicket.createdAt || new Date().toISOString(),
                ...newTicket,
            };
            setAllTickets(prev => {
                const next = [withCreatedAt, ...prev];
                next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return next;
            });
        }
    }, []);

    // Memoized format date function
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    // Memoized status config getter
    const getStatusConfig = useCallback((status) => {
        return STATUS_CONFIGS[status] || DEFAULT_STATUS_CONFIG;
    }, []);

    // Memoized stats
    const stats = useMemo(() => {
        const pending = allTickets.filter(t =>
            ['Open', 'Pending', 'InProgress'].includes(t?.status)
        ).length;
        const resolved = allTickets.filter(t =>
            ['Accepted', 'Approved', 'Resolved', 'Closed'].includes(t?.status)
        ).length;

        return {
            total: allTickets.length,
            pending,
            resolved,
        };
    }, [allTickets]);

    // Memoized tabs
    const tabs = useMemo(() => {
        const pending = allTickets.filter(t =>
            ['Open', 'Pending', 'InProgress'].includes(t?.status)
        ).length;
        const approved = allTickets.filter(t =>
            ['Accepted', 'Approved', 'Resolved', 'Closed'].includes(t?.status)
        ).length;
        const rejected = allTickets.filter(t => t?.status === 'Rejected').length;

        return [
            { id: 'all', label: 'Tất cả', count: allTickets.length },
            { id: 'pending', label: 'Đang xử lý', count: pending },
            { id: 'approved', label: 'Đã duyệt', count: approved },
            { id: 'rejected', label: 'Bị từ chối', count: rejected },
        ];
    }, [allTickets]);

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Phiếu hỗ trợ
                        </h1>
                        <p className="text-gray-600">
                            Quản lý và theo dõi các yêu cầu hỗ trợ của bạn
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo phiếu mới
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng phiếu</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Đã giải quyết</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc mã phiếu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${isActive
                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Ticket List */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-24 bg-gray-200 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có phiếu hỗ trợ nào</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery ? 'Không tìm thấy phiếu nào phù hợp với từ khóa của bạn' : 'Tạo phiếu hỗ trợ mới để nhận sự giúp đỡ từ chúng tôi'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Tạo phiếu mới
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        {displayedTickets.map((ticket) => {
                            const statusConfig = getStatusConfig(ticket.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <article
                                    key={ticket.id}
                                    onClick={() => navigate(`/lecturer/ticket/${ticket.ticketCode}`)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-yellow-300 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={`w-12 h-12 ${statusConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2">
                                                        {ticket.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex-shrink-0`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {ticket.contents}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDate(ticket.createdAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        #{ticket.ticketCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${currentPage === 1
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${currentPage === page
                                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${currentPage === totalPages
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                                    }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

export default LecturerTicketList;
