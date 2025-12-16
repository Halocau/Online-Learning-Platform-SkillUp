import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Layout/Header.jsx';
import Footer from '@/components/Layout/Footer.jsx';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '../../components/Ticket/CreateTicketModal.jsx';
import { jwtDecode } from 'jwt-decode';
import TicketFilterPanel from '@/components/Ticket/TicketFilterPanel.jsx';

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

  const getCurrentUserId = useCallback(() => {
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.userId) return parsed.userId;

      // Fallback: decode accessToken nếu chưa có "user"
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        if (decoded?.userId) return decoded.userId;
      }
    } catch { }
    return null;
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);

        const accountId = getCurrentUserId();
        if (!accountId) {
          toast.error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
          setAllTickets([]);
          setFilteredTickets([]);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        // Build endpoint: /Ticket/account-tickets/{accountId}
        const endpoint = API_ENDPOINTS.ACCOUNT_TICKETS.replace('{accountId}', accountId);

        const response = await axiosInstance.get(endpoint);

        if (response.data?.code === 200) {
          // giả định backend trả về dạng mảng ở data[0] giống endpoint cũ
          const raw = response.data.data?.[0] || [];
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
        {/** 
          else {
          toast.error('Không thể tải danh sách ticket');
        }
          */}
      } catch (error) {
        console.error('Error fetching tickets:', error);
        // toast.error('Không thể tải danh sách ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger]); // giữ nguyên: refetch khi tạo mới/trigger


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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Phiếu hỗ trợ</h1>
          <p className="text-gray-600">
            {filteredTickets.length} ticket •
            {filteredTickets.filter(t => t.status === 'Open' || t.status === 'Pending').length} đang mở •
            {filteredTickets.filter(t => ['InProgress'].includes(t.status)).length} đang xử lý
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <TicketFilterPanel
              activeTab={activeTab}
              onChangeTab={setActiveTab} // vẫn set state cục bộ
              onCreateNew={() => setIsModalOpen(true)}
              title="Lọc phiếu hỗ trợ"
              variant="card"
            />
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
                        {/* min-w-0 để flex item cho phép text xuống dòng */}
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            📄
                          </div>
                          {/* khối text cũng cần min-w-0 */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-3 mb-1 min-w-0">
                              {/* Cho phép xuống dòng + bẻ cả chuỗi dài không khoảng trắng */}
                              <h4 className="text-lg font-semibold text-gray-900 whitespace-normal break-all">
                                {ticket.title}
                              </h4>
                              {/* Badge có thể shrink-0 để không đẩy chữ */}
                              <span className="shrink-0">
                                {getStatusBadge(ticket.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Tạo vào {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                        </div>
                        {/* Nút không co lại và không đẩy layout */}
                        <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all shrink-0">
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
