import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { notificationAPI } from "@/api/notificationAPI";
import notificationHubService from "@/hubs/notificationHubService";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

const isNotificationUnread = (notification) =>
  notification.status === "Unread" ||
  !notification.status ||
  notification.status === "";

const normalizeNotification = (notification = {}) => {
  const id = notification.id || notification.Id;
  const createdAt = notification.createdAt || notification.CreatedAt;
  const status = notification.status || notification.Status || "Unread";

  return {
    ...notification,
    id,
    accountId: notification.accountId || notification.AccountId,
    title: notification.title || notification.Title || "Thông báo",
    contents: notification.contents || notification.Contents || "",
    status,
    createdAt: createdAt || new Date().toISOString(),
    hyperlink: notification.hyperlink || notification.Hyperlink || "",
  };
};

const sortNotifications = (list) =>
  [...list].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

function NotificationBell() {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const notificationRef = useRef(null);
  const showDropdownRef = useRef(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => isNotificationUnread(notification)).length;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    if (!notifications.length) return [];
    return notifications.slice(0, Math.min(visibleCount, notifications.length));
  }, [notifications, visibleCount]);

  const groupedNotifications = useMemo(() => {
    if (!visibleNotifications.length) {
      return { unread: [], read: [] };
    }

    const sorted = [...visibleNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      unread: sorted.filter((notification) => isNotificationUnread(notification)),
      read: sorted.filter((notification) => !isNotificationUnread(notification)),
    };
  }, [visibleNotifications]);

  const hasMoreNotifications = visibleCount < notifications.length;

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);
      const data = await notificationAPI.getMyNotifications();
      const notificationsList = Array.isArray(data) ? data : [];
      const uniqueMap = new Map();

      notificationsList.forEach((item) => {
        const normalized = normalizeNotification(item);
        if (normalized.id) {
          uniqueMap.set(normalized.id, normalized);
        }
      });

      setNotifications(sortNotifications([...uniqueMap.values()]));
      setVisibleCount(5);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status !== 401) {
        toast.error("Không thể tải thông báo");
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, [accessToken]);

  useEffect(() => {
    showDropdownRef.current = showNotificationDropdown;
  }, [showNotificationDropdown]);

  const handleRealtimeNotification = useCallback(
    (notification) => {
      const normalized = normalizeNotification(notification);
      if (!normalized.id) {
        fetchNotifications();
        return;
      }

      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === normalized.id);
        const nextList = exists
          ? prev.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...prev];

        return sortNotifications(nextList);
      });

      if (!showDropdownRef.current) {
        toast.info(normalized.title || "Bạn có thông báo mới");
      }
    },
    [fetchNotifications]
  );

  useEffect(() => {
    if (!accessToken) {
      setNotifications([]);
      notificationHubService.stopConnection();
      return;
    }

    fetchNotifications();
  }, [accessToken, fetchNotifications]);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    notificationHubService
      .startConnection()
      .then(() => {
        if (!isMounted) return;
        notificationHubService.onNotificationReceived(handleRealtimeNotification);
      })
      .catch((error) => {
        console.error("Không thể kết nối realtime thông báo:", error);
      });

    return () => {
      isMounted = false;
      notificationHubService.offNotificationReceived(handleRealtimeNotification);
    };
  }, [accessToken, handleRealtimeNotification]);


  useEffect(() => {
    if (!showNotificationDropdown) return;

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationDropdown]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNotifications([]);
        setShowNotificationDropdown(false);
        notificationHubService.stopConnection();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    const unread = isNotificationUnread(notification);

    if (unread) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, status: "Read" } : item
        )
      );

      try {
        await notificationAPI.markAsRead(notification.id);
      } catch (error) {
        console.error("Không thể đánh dấu đã đọc:", error);
        toast.error("Không thể đánh dấu thông báo này");
        fetchNotifications();
      }
    }

    if (notification.hyperlink) {
      setShowNotificationDropdown(false);
      if (notification.hyperlink.startsWith("http")) {
        window.open(notification.hyperlink, "_blank", "noopener,noreferrer");
      } else {
        navigate(notification.hyperlink);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    setNotifications((prev) =>
      prev.map((item) =>
        isNotificationUnread(item) ? { ...item, status: "Read" } : item
      )
    );

    try {
      await notificationAPI.markAllAsRead();
      toast.success("Đã đánh dấu tất cả thông báo");
    } catch (error) {
      console.error("Không thể đánh dấu tất cả thông báo:", error);
      toast.error("Không thể đánh dấu tất cả thông báo");
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + 5, notifications.length)
    );
  };

  const renderSection = (title, items) => {
    if (!items.length) return null;

    return (
      <div>
        <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-[#2d334a]/70">
          {title}
        </p>
        <div className="space-y-1">
          {items.map((notification) => {
            const unread = isNotificationUnread(notification);
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex cursor-pointer gap-3 px-4 py-3 transition-colors ${unread
                  ? "bg-[#e3f6f5]/70 hover:bg-[#e3f6f5]"
                  : "hover:bg-[#f4f4f4]"
                  }`}
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${unread ? "bg-[#e3f6f5]" : "bg-[#f4f4f4]"
                    }`}
                >
                  <Bell className="h-5 w-5 text-[#272343]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-[#272343] line-clamp-1">
                      {notification.title}
                    </h4>
                    <span className="text-[11px] text-[#2d334a]/60 whitespace-nowrap">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#2d334a] line-clamp-2">
                    {notification.contents}
                  </p>
                  {notification.hyperlink && (
                    <span className="mt-1 inline-flex text-xs font-medium text-[#0077ff]">
                      Xem chi tiết
                    </span>
                  )}
                </div>
                {unread && <span className="mt-1 h-2 w-2 self-start rounded-full bg-[#ff6b6b]" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={(event) => {
          event.stopPropagation();
          const willOpen = !showNotificationDropdown;
          setShowNotificationDropdown(willOpen);
          if (willOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-[#2d334a] transition-colors hover:text-[#272343]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotificationDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-[460px] overflow-hidden rounded-2xl border border-[#272343]/15 bg-[#fffffe] shadow-[0_18px_60px_rgba(39,35,67,0.18)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#272343]/15 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[#272343]">Thông báo</h3>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              className="flex items-center gap-1 rounded-full border border-[#272343]/20 px-3 py-1 text-xs font-semibold text-[#272343] transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#e3f6f5]"
            >
              {markingAll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Đánh dấu đã đọc
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingNotifications ? (
              <div className="space-y-2 px-4 py-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-[#e3f6f5]" />
                    <div className="h-3 w-2/3 rounded-full bg-[#e3f6f5]" />
                    <div className="h-3 w-1/2 rounded-full bg-[#e3f6f5]" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[#2d334a]">
                Bạn chưa có thông báo nào
              </div>
            ) : (
              <div className="pb-3">
                {renderSection("Mới", groupedNotifications.unread)}
                {renderSection("Trước đó", groupedNotifications.read)}
                {hasMoreNotifications && (
                  <div className="px-4 pt-2">
                    <button
                      onClick={handleShowMore}
                      className="w-full rounded-full border border-[#272343]/20 px-4 py-2 text-sm font-semibold text-[#272343] transition-colors hover:bg-[#e3f6f5]"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
