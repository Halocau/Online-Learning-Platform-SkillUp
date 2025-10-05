import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">SkillUp</span>
          </Link>

          {/* Categories - Hidden on mobile */}
          <nav className="hidden lg:flex items-center">
            <button className="text-gray-700 hover:text-purple-600 font-medium px-4 py-2 transition-colors">
              Khám phá
            </button>
          </nav>

          {/* Search Bar - Responsive */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>

          {/* Right Menu - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            
            {/* Business Link - Hidden on small screens */}
            <Link to="/business" className="hidden md:block text-gray-700 hover:text-purple-600 font-medium transition-colors text-sm">
              SkillUp Business
            </Link>
            
            {/* Teach Link - Hidden on mobile */}
            <Link to="/teach" className="hidden lg:block text-gray-700 hover:text-purple-600 font-medium transition-colors text-sm">
              Giảng dạy
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="text-gray-700 hover:text-purple-600 transition-colors p-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 8M7 13l2.5 8M13 13v8" />
              </svg>
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">U</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block text-gray-700 hover:text-purple-600 font-medium transition-colors text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors border border-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-50 text-sm"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gray-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}         
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;