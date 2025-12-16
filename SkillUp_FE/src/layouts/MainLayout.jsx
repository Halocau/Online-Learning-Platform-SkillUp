import { Outlet } from 'react-router-dom';
import Header from '../components/Layout/Header.jsx';
import Footer from '../components/Layout/Footer.jsx';
import { Scroll } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop.jsx';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Layout;