import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import { notificationAPI } from "@/api/notificationAPI";

function NotificationBell() {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const lastFetchTimeRef = useRef(0);
  const notificationRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  // Tính số thông báo chưa đọc (tối ưu với useMemo)
  const unreadCount = useMemo(() => {
    return notifications.filter(
      (n) => n.status === "Unread" || !n.status || n.status === ""
    ).length;
  }, [notifications]);

  // Fetch notifications với debounce (tránh fetch quá nhiều)
  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) {
        setNotifications([]);
        return;
      }

      // Chỉ fetch nếu force refresh hoặc đã qua 30 giây từ lần fetch cuối
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTimeRef.current < 30000) {
        return;
      }

      try {
        setLoadingNotifications(true);
        const data = await notificationAPI.getMyNotifications();
        // API trả về array trực tiếp
        const notificationsList = Array.isArray(data) ? data : [];
        setNotifications(notificationsList);
        lastFetchTimeRef.current = now;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Không hiển thị error nếu chỉ là lỗi 401 (chưa đăng nhập)
        if (error.response?.status !== 401) {
          // Chỉ hiển thị error nếu đang mở dropdown
          if (showNotificationDropdown) {
            toast.error("Không thể tải thông báo");
          }
        }
      } finally {
        setLoadingNotifications(false);
      }
    },
    [accessToken, showNotificationDropdown]
  );

  // Fetch notifications khi component mount hoặc accessToken thay đổi
  useEffect(() => {
    if (accessToken) {
      fetchNotifications(true); // Force fetch lần đầu
    } else {
      setNotifications([]); // Clear khi không có token
    }
  }, [accessToken, fetchNotifications]);

  // Auto refresh notifications mỗi 60 giây khi đã đăng nhập
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      fetchNotifications(false); // Không force, sẽ check debounce
    }, 60000); // 60 giây

    return () => clearInterval(interval);
  }, [accessToken, fetchNotifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!showNotificationDropdown) return;

    const handleClickOutside = (event) => {
      // Kiểm tra xem click có nằm trong notificationRef không
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    // Dùng mousedown thay vì click để tránh conflict với button onClick
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationDropdown]);

  // Clear notifications khi logout (listen to storage change)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNotifications([]);
        setShowNotificationDropdown(false);
        lastFetchTimeRef.current = 0;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!accessToken) {
    return null; // Không hiển thị nếu chưa đăng nhập
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const willOpen = !showNotificationDropdown;
          setShowNotificationDropdown(willOpen);
          // Chỉ fetch khi mở dropdown và chưa có data hoặc data cũ hơn 30s
          if (willOpen) {
            fetchNotifications(true); // Force refresh khi mở
          }
        }}
        className="text-[#2d334a] hover:text-[#272343] transition-colors p-2 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotificationDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-[#fffffe] rounded-2xl shadow-[0_18px_60px_rgba(39,35,67,0.18)] border border-[#272343]/15 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#272343]/15">
            <h3 className="text-sm font-semibold text-[#272343]">Thông báo</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loadingNotifications ? (
              <div className="px-4 py-8 text-center text-sm text-[#2d334a]">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#2d334a]">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-[#272343]/10 hover:bg-[#e3f6f5] transition-colors cursor-pointer ${notification.status === "Unread" ||
                    !notification.status ||
                    notification.status === ""
                    ? "bg-[#e3f6f5]/50"
                    : ""
                    }`}
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-[#272343]">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-[#2d334a] line-clamp-2">
                      {notification.contents}
                    </p>
                    <span className="text-xs text-[#2d334a]/60">
                      {new Date(notification.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

