import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '../../components/Ticket/CreateTicketModal';

const PAGE_SIZE = 5;

function TicketList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Master list (tất cả)
  const [allTickets, setAllTickets] = useState([]);
  // Sau khi lọc theo tab
  const [filteredTickets, setFilteredTickets] = useState([]);
  // Sau khi phân trang
  const [displayedTickets, setDisplayedTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 'all' | 'approved' | 'rejected'
  const [activeTab, setActiveTab] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // đọc ?tab=all|approved|rejected từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qTab = (params.get('tab') || '').toLowerCase();
    const valid = ['all', 'approved', 'rejected'];
    setActiveTab(valid.includes(qTab) ? qTab : 'all');
  }, [location.search]);

  const filterByTab = useCallback((items, tab) => {
    if (!Array.isArray(items)) return [];
    switch (tab) {
      case 'approved':
        return items.filter(t =>
          ['Accepted', 'Approved', 'Resolved', 'Closed'].includes(t?.status)
        );
      case 'rejected':
        return items.filter(t => t?.status === 'Rejected');
      default:
        return items;
    }
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const endpoint = API_ENDPOINTS.ALL_TICKETS;
        const response = await axiosInstance.get(endpoint);

        if (response.data.code === 200) {
          const raw = response.data.data[0] || [];
          // sort newest first
          const sorted = [...raw].sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
          });

          setAllTickets(sorted);

          const filtered = filterByTab(sorted, activeTab);
          setFilteredTickets(filtered);
          setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Không thể tải danh sách ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger]); // không phụ thuộc activeTab => chỉ lọc lại client-side

  // Re-filter khi đổi tab hoặc dữ liệu gốc thay đổi
  useEffect(() => {
    const filtered = filterByTab(allTickets, activeTab);
    setFilteredTickets(filtered);
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
    setCurrentPage(1);
  }, [activeTab, allTickets, filterByTab]);

  // Phân trang
  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedTickets(filteredTickets.slice(startIndex, endIndex));
  }, [currentPage, filteredTickets]);

  const handleCreateSuccess = (newTicket) => {
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
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Open: 'bg-blue-100 text-blue-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      InProgress: 'bg-yellow-100 text-yellow-700',
      Accepted: 'bg-green-100 text-green-700',
      Resolved: 'bg-green-100 text-green-700',
      Approved: 'bg-green-100 text-green-700',
      Closed: 'bg-gray-100 text-gray-700',
      Rejected: 'bg-red-100 text-red-700',
    };
    const statusLabels = {
      Open: 'Mở',
      Pending: 'Chờ duyệt',
      InProgress: 'Đang xử lý',
      Accepted: 'Đã duyệt',
      Resolved: 'Đã giải quyết',
      Approved: 'Đã duyệt',
      Closed: 'Đã đóng',
      Rejected: 'Bị từ chối',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hỗ trợ Ticket</h1>
          <p className="text-gray-600">
            {filteredTickets.length} ticket •
            {filteredTickets.filter(t => t.status === 'Open' || t.status === 'Pending').length} đang mở •
            {filteredTickets.filter(t => ['InProgress'].includes(t.status)).length} đang xử lý
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Trung tâm ticket</h3>
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'all'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Tất cả ticket
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'approved'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Ticket đã duyệt
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'rejected'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Ticket bị từ chối
                </button>
              </nav>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-xl">➕</span>
                Tạo ticket
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có ticket nào</h3>
                <p className="text-gray-600 mb-6">Tạo ticket mới để nhận hỗ trợ từ chúng tôi</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all"
                >
                  <span>➕</span>
                  Tạo ticket
                </button>
              </div>
            ) : (
              <>
                {/* Ticket List */}
                <div className="space-y-4">
                  {displayedTickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/ticket/${ticket.ticketCode}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-grow">
                          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            📄
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-semibold text-gray-900">{ticket.title}</h4>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              Tạo vào {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all">
                          Xem
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <nav className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    ❮
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${currentPage === index + 1
                        ? 'bg-yellow-400 text-gray-900 shadow-md'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    ❯
                  </button>
                </nav>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default TicketList;
