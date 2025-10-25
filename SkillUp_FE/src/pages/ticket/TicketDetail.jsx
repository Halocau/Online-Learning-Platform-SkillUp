import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '../../components/Ticket/CreateTicketModal';
import UpdateTicketModal from '../../components/Ticket/UpdateTicketModal';

function TicketDetail() {
    const { ticketCode } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

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
            toast.error('Không thể tải thông tin ticket');
            navigate('/ticket');
        } finally {
            setLoading(false);
        }
    }, [ticketCode, navigate]);

    useEffect(() => {
        fetchTicketDetail();
    }, [fetchTicketDetail]);

    const handleCreateSuccess = () => {
        setIsModalOpen(false);
        toast.success('Tạo ticket mới thành công!');
        navigate('/ticket');
    };

    const handleUpdateSuccess = () => {
        setIsUpdateOpen(false);
        fetchTicketDetail();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Open: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Mới', icon: '🆕' },
            Pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Đang xử lý', icon: '⏳' },
            Resolved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Đã giải quyết', icon: '✅' },
            Closed: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Đã đóng', icon: '🔒' },
        };
        const cfg = statusConfig[status] || statusConfig.Open;
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                <span>{cfg.icon}</span>
                {cfg.label}
            </span>
        );
    };

    // LOADING
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                    <div className="animate-pulse space-y-6">
                        <div className="h-6 w-56 bg-gray-200 rounded" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-40 bg-white rounded-xl border border-gray-200" />
                                <div className="h-24 bg-white rounded-xl border border-gray-200" />
                                <div className="h-24 bg-white rounded-xl border border-gray-200" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-64 bg-white rounded-xl border border-gray-200" />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // NOT FOUND
    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mx-auto max-w-xl p-10 text-center">
                        <div className="text-5xl mb-3">🙈</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy ticket</h2>
                        <p className="text-gray-600 mb-6">Ticket này không tồn tại hoặc đã bị xóa.</p>
                        <button
                            onClick={() => navigate('/ticket')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors"
                        >
                            <span>←</span> Quay lại danh sách
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // NORMAL
    const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : [];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40 w-full">
                {/* Breadcrumb + Title */}
                <div className="mb-6">
                    <nav className="text-sm text-gray-500 mb-2">
                        <button onClick={() => navigate('/ticket')} className="hover:text-gray-700 hover:underline">
                            My Tickets
                        </button>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-medium">#{ticket.ticketCode}</span>
                    </nav>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                            <p className="mt-1 text-sm text-gray-500">Tạo lúc {formatDateTime(ticket.createdAt)}</p>
                        </div>
                        <button
                            onClick={() => navigate('/ticket')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 font-medium"
                        >
                            <span>←</span> Quay lại
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* Sidebar trái: Ticket center */}
                    <aside className="lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Ticket center</h3>
                            <nav className="space-y-1">
                                <button type="button" className="w-full text-left px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                    Danh sách
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 rounded-lg bg-yellow-400 text-gray-900 font-semibold shadow-sm"
                                    aria-current="page"
                                >
                                    My Tickets
                                </button>
                                <button type="button" className="w-full text-left px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                    Assigned to me
                                </button>
                                <button type="button" className="w-full text-left px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                    All ticket
                                </button>
                            </nav>

                            {/* giữ nút tạo ticket tại đây */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold shadow-sm"
                            >
                                <span>➕</span> Tạo ticket
                            </button>
                        </div>
                    </aside>

                    {/* Main */}
                    <div className="flex-grow">
                        <div className="flex flex-col-reverse lg:flex-row lg:gap-8">
                            {/* Left: content + replies */}
                            <section className="flex-grow space-y-6">
                                {/* Original message */}
                                <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <header className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-800">{ticket.accountName || 'Bạn'} đã gửi</span>
                                        </div>
                                        <time className="text-sm text-gray-500">{formatDateTime(ticket.createdAt)}</time>
                                    </header>

                                    <div className="p-5 text-gray-800 whitespace-pre-wrap leading-relaxed">{ticket.contents}</div>

                                    {attachments.length > 0 && (
                                        <div className="border-t border-gray-200 p-5">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tệp đính kèm</h4>
                                            <div className="grid sm:grid-cols-2 gap-2">
                                                {attachments.map((file, i) => (
                                                    <a
                                                        key={i}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                                                    >
                                                        <span className="text-xl">📎</span>
                                                        <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                                                            {file.name || file.url}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </article>

                                {/* Replies */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Phản hồi</h3>
                                    {ticket.response ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
                                            <div className="px-5 py-3 border-b bg-yellow-50 border-yellow-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-yellow-700">Support</span>
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                        Staff
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                {ticket.response}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                                            <div className="text-3xl mb-2">💬</div>
                                            <p className="text-gray-600">Chưa có phản hồi nào</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Right: ticket meta */}
                            <aside className="lg:w-80 flex-shrink-0 mb-6 lg:mb-0">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Thông tin ticket</h4>
                                    <dl className="space-y-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <dt className="text-gray-600">Mã Ticket</dt>
                                            <dd className="font-semibold text-gray-900">#{ticket.ticketCode}</dd>
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <dt className="text-gray-600">Trạng thái</dt>
                                            <dd>{getStatusBadge(ticket.status)}</dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-gray-600">Ngày tạo</dt>
                                            <dd className="font-medium text-gray-900">{formatDateTime(ticket.createdAt)}</dd>
                                        </div>
                                    </dl>

                                    {/* NÚT Ở ĐÚNG VỊ TRÍ CŨ: thay "Đóng Ticket này" => "Cập nhật ticket" */}
                                    <button
                                        className="w-full mt-5 px-4 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors"
                                        onClick={() => setIsUpdateOpen(true)}
                                    >
                                        Cập nhật ticket
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Create */}
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Update */}
            <UpdateTicketModal
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                onSuccess={handleUpdateSuccess}
                ticket={ticket}
            />
        </div>
    );
}

export default TicketDetail;
