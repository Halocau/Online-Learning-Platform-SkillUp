import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import CreateTicketModal from '../../components/Ticket/CreateTicketModal';

const PAGE_SIZE = 5;

function TicketList() {
  const navigate = useNavigate();
  const [allTickets, setAllTickets] = useState([]);
  const [displayedTickets, setDisplayedTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        let endpoint = API_ENDPOINTS.ALL_TICKETS;
        let params = {};

        if (activeTab === 'my') {
          const user = JSON.parse(localStorage.getItem('token'));
          if (user && user.userId) {
            endpoint = `/Ticket/account-tickets/${user.userId}`;
          } else {
            toast.error('Không tìm thấy thông tin tài khoản');
            setLoading(false);
            return;
          }
        }

        const response = await axiosInstance.get(endpoint, { params });

        if (response.data.code === 200) {
          const allData = response.data.data[0] || [];
          setAllTickets(allData);

          // 1. Sửa logic: Đảm bảo totalPages luôn ít nhất là 1
          setTotalPages(Math.ceil(allData.length / PAGE_SIZE) || 1);

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
  }, [activeTab, refetchTrigger]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const ticketsForPage = allTickets.slice(startIndex, endIndex);
    setDisplayedTickets(ticketsForPage);
  }, [currentPage, allTickets]);

  const handleCreateSuccess = (newTicket) => {
    setIsModalOpen(false);
    // Không ép sang tab "my" -> tránh case thiếu userId
    setRefetchTrigger(prev => prev + 1);
    // (khuyến khích) cập nhật lạc quan để thấy ngay trên UI
    if (newTicket) {
      setAllTickets(prev => {
        const next = [newTicket, ...prev];
        setTotalPages(Math.ceil(next.length / PAGE_SIZE) || 1);
        setCurrentPage(1);
        return next;
      });
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Open': 'bg-blue-100 text-blue-700',
      'InProgress': 'bg-yellow-100 text-yellow-700',
      'Resolved': 'bg-green-100 text-green-700',
      'Closed': 'bg-gray-100 text-gray-700'
    };
    const statusLabels = {
      'Open': 'Mới',
      'InProgress': 'Đang xử lý',
      'Resolved': 'Đã giải quyết',
      'Closed': 'Đã đóng'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Ticket</h1>
          <p className="text-gray-600">
            {allTickets.length} tickets •
            {allTickets.filter(t => t.status === 'Open').length} mới •
            {allTickets.filter(t => t.status === 'InProgress').length} đang xử lý
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            {/* ... code sidebar không đổi ... */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Ticket center</h3>
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'all'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  All tickets
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'my'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  My Tickets
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
            ) : allTickets.length === 0 ? (
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
                      {/* ... code article không đổi ... */}
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

                {/* 2. Xóa điều kiện 'totalPages > 1' */}
                {/* Giờ thanh <nav> sẽ LUÔN LUÔN render */}
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
                    disabled={currentPage === totalPages} // Logic này giờ đã đúng vì totalPages luôn >= 1
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