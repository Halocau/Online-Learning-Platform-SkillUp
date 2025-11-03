import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '@/config/api';
import { toast } from 'react-toastify';
import LecturerSidebar from '@/components/Layout/LecturerSidebar';
import LecturerTopbar from '@/components/Layout/LecturerTopBar';

/**
 * LecturerLayout - Main layout component for lecturer dashboard
 * Handles CV approval check and navigation flow
 */
function LecturerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [cvApproved, setCvApproved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkCVStatus();
  }, []);

  /**
   * Check if lecturer's CV is approved
   * If not approved and not on apply page, redirect to apply-cv
   */
  const checkCVStatus = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      const response = await axiosInstance.get('/LecturerApplication/my-applications');

      if (response.data.code === 200 && response.data.data[0]?.length > 0) {
        const latestApplication = response.data.data[0][0];
        
        // Check if the latest application is approved
        if (latestApplication.status === 'Approved') {
          setCvApproved(true);
        } else if (latestApplication.status === 'Pending') {
          // If pending, redirect to applications page
          if (location.pathname !== '/lecturer/applications') {
            navigate('/lecturer/applications', { replace: true });
          }
        } else if (latestApplication.status === 'Rejected') {
          // If rejected, user can apply again
          if (location.pathname !== '/lecturer/apply-cv') {
            navigate('/lecturer/apply-cv', { replace: true });
          }
        }
      } else {
        // No applications, redirect to apply-cv
        if (location.pathname !== '/lecturer/apply-cv') {
          navigate('/lecturer/apply-cv', { replace: true });
        }
      }
    } catch (error) {
      console.error('Check CV status error:', error);
      // On error, redirect to apply-cv to be safe
      if (location.pathname !== '/lecturer/apply-cv' && location.pathname !== '/lecturer/applications') {
        navigate('/lecturer/apply-cv', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <LecturerSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <LecturerTopbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onRefreshStatus={checkCVStatus}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet context={{ cvApproved, refreshStatus: checkCVStatus }} />
        </main>
      </div>
    </div>
  );
}

export default LecturerLayout;