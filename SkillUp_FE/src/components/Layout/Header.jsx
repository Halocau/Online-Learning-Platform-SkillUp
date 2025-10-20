import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("token") !== null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b border-[#EAEAEA] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <image src="/SkillUp_FE/src/assets/logo_skillup.png" alt="SkillUp Logo" className="h-8 w-8" />
            <span className="text-xl lg:text-2xl font-bold text-black">
              SkillUp
            </span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="relative flex-1 max-w-2xl mx-2 sm:mx-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-[#EAEAEA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFD500] focus:border-transparent bg-[#F9F9F9] text-sm sm:text-base"
            />
            <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </form>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="border border-black text-black px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#F5F5F5] transition-colors font-medium text-sm rounded-md"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-[#FFD500] text-black px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#E5C100] transition-colors font-medium text-sm rounded-md"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-black hover:text-[#FFD500] font-medium text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
