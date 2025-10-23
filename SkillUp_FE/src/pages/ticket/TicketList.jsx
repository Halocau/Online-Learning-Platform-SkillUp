import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

function TicketList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all'); // all, my, assigned

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        let endpoint = API_ENDPOINTS.ALL_TICKETS;
        let params = {
          page: currentPage,
          pageSize: 10
        };

        if (activeTab === 'my') {
          // Lấy accountId từ localStorage
          const user = JSON.parse(localStorage.getItem('user'));
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
          setTickets(response.data.data[0] || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Không thể tải danh sách ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [currentPage, activeTab]);

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Ticket</h1>
          <p className="text-gray-600">
            {tickets.length} tickets •
            {tickets.filter(t => t.status === 'Open').length} mới •
            {tickets.filter(t => t.status === 'InProgress').length} đang xử lý
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
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
                onClick={() => navigate('/ticket/create')}
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
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có ticket nào</h3>
                <p className="text-gray-600 mb-6">Tạo ticket mới để nhận hỗ trợ từ chúng tôi</p>
                <button
                  onClick={() => navigate('/ticket/create')}
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
                  {tickets.map((ticket) => (
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
                {totalPages > 1 && (
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
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TicketList;
