import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";
import { Search, Star, Users, Loader2 } from "lucide-react";

const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const formatCoursePrice = (price) => {
    if (price === 0) return "Miễn phí";
    if (typeof price === "number") {
        return `₫${price.toLocaleString("vi-VN")}`;
    }
    return "Đang cập nhật";
};

function SearchEngine() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = useRef(null);
    const debouncedQuery = useDebounce(searchQuery);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            setShowSuggestions(false);
            return;
        }

        let isCancelled = false;

        const fetchCourses = async () => {
            try {
                setIsSearching(true);
                const response = await courseAPI.searchCourses(debouncedQuery, 30);
                if (isCancelled) return;
                const payload = Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
                setSearchResults(payload);
                setShowSuggestions(true);
            } catch (error) {
                if (!isCancelled) {
                    console.error("Search suggestion error:", error);
                    setSearchResults([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsSearching(false);
                }
            }
        };

        fetchCourses();

        return () => {
            isCancelled = true;
        };
    }, [debouncedQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showSuggestions &&
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [showSuggestions]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        if (searchResults.length > 0) {
            navigate(`/course/${searchResults[0].id}`);
            setShowSuggestions(false);
            setSearchQuery("");
        } else {
            // If no results but user submitted, show message
            toast.info("Không tìm thấy kết quả. Vui lòng thử từ khóa khác.");
        }
    };

    const handleInputFocus = () => {
        // Nếu có searchQuery và có kết quả, hiển thị lại dropdown
        if (searchQuery.trim() && searchResults.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="flex-1 max-w-2xl mx-2 sm:mx-4" ref={searchWrapperRef}>
            <form onSubmit={handleSearch} className="relative w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-10 pr-4 py-2 border border-[#272343]/15 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent bg-[#fffffe] text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-[#2d334a]" />
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#fffffe] border border-[#272343]/15 rounded-xl shadow-[0_18px_60px_rgba(39,35,67,0.18)] z-50 max-h-[400px] overflow-y-auto">
                        {isSearching ? (
                            <div className="p-6 text-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[#FFD54F] mx-auto mb-2" />
                                <p className="text-xs text-[#2d334a] font-medium">Đang tìm kiếm...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="py-1.5">
                                <div className="px-3 py-1.5 border-b border-[#272343]/10">
                                    <p className="text-[10px] font-semibold text-[#2d334a]/70 uppercase tracking-wide">
                                        {searchResults.length} kết quả tìm thấy
                                    </p>
                                </div>
                                <div className="divide-y divide-[#272343]/5">
                                    {searchResults.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/course/${course.id}`}
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                setSearchQuery("");
                                            }}
                                            className="block px-3 py-2.5 hover:bg-[#e3f6f5]/50 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Course Image */}
                                                <div className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-[#e3f6f5] ring-1 ring-[#272343]/10 group-hover:ring-[#FFD54F]/50 transition-all">
                                                    {course.image ? (
                                                        <img
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Search className="w-4 h-4 text-[#272343]/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Course Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-semibold text-[#272343] line-clamp-1 group-hover:text-[#FFD54F] transition-colors leading-tight mb-1">
                                                        {course.title}
                                                    </h4>

                                                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                                        <p className="text-[10px] text-[#2d334a]/60 font-medium truncate">
                                                            {course.lecturerName || "Giảng viên"}
                                                        </p>

                                                        {/* Rating */}
                                                        {course.rating > 0 ? (
                                                            <div className="flex items-center gap-1">
                                                                <div className="flex items-center gap-0.5">
                                                                    {Array.from({ length: 5 }, (_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-2.5 h-2.5 ${i < Math.floor(course.rating)
                                                                                ? "fill-[#FFD54F] text-[#FFD54F]"
                                                                                : "fill-[#e5e7eb] text-[#e5e7eb]"
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-[#2d334a]">
                                                                    {course.rating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        ) : null}

                                                        {/* Enrollment */}
                                                        {course.enrollmentCount > 0 && (
                                                            <div className="flex items-center gap-1 text-[#2d334a]/60">
                                                                <Users className="w-3 h-3" />
                                                                <span className="text-[10px] font-medium">
                                                                    {course.enrollmentCount}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Price */}
                                                    <p className="text-xs font-bold text-[#272343]">
                                                        {formatCoursePrice(course.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <Search className="w-8 h-8 text-[#e3f6f5] mx-auto mb-2" />
                                <p className="text-xs font-medium text-[#2d334a] mb-1">
                                    Không tìm thấy kết quả
                                </p>
                                <p className="text-[10px] text-[#2d334a]/60">
                                    Thử với từ khóa khác
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}

export default SearchEngine;

