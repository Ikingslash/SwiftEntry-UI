import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";
import { useSidebar } from "../../../layout/SidebarContext";
import UserAvatar from "../../../components/UserAvatar";

function StaffTopHeader() {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const { unreadCount, latestUnread, markAsRead, fetchLatestUnread } =
    useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-white h-[72px] px-4 sm:px-6 lg:px-8 shadow-sm border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
      <button
        type="button"
        onClick={openSidebar}
        className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border-0 cursor-pointer transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
      <div className="relative" ref={notificationRef}>
        <button
          type="button"
          onMouseEnter={() => {
            setShowNotifications(true);
            fetchLatestUnread();
          }}
          onClick={() => navigate("/staff-dashboard/notifications")}
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center focus-visible:outline-none"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            onMouseLeave={() => setShowNotifications(false)}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-72 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h6 className="font-bold text-slate-900 text-xs mb-0">
                Recent Notifications
              </h6>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex flex-col divide-y divide-slate-50 max-h-60 overflow-y-auto">
              {latestUnread.length > 0 ? (
                latestUnread.map((notification) => (
                  <Link
                    key={notification.id}
                    to="/staff-dashboard/notifications"
                    onClick={() => markAsRead(notification.id)}
                    className="px-4 py-2.5 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5 cursor-pointer no-underline"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-0">
                        {notification.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mb-0 leading-tight mt-0.5">
                        {notification.message}
                      </p>
                      {notification.created_at && (
                        <span className="text-[9px] text-slate-400">
                          {notification.created_at}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-[11px] text-slate-400">
                  No new notifications
                </div>
              )}
            </div>

            <div className="p-2.5 bg-slate-50/50 border-t border-slate-100 text-center">
              <Link
                to="/staff-dashboard/notifications"
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 no-underline transition-colors block"
              >
                See all notifications
              </Link>
            </div>
          </div>
        )}
      </div>

      <Link
        to="/staff-dashboard/profile"
        className="flex items-center gap-3 ps-3 sm:ps-4 border-l border-slate-200 no-underline"
        style={{ textDecoration: "none" }}
      >
        {user?.profile_picture || user?.photo ? (
          <UserAvatar
            image={user.profile_picture || user.photo}
            firstName={user?.name || "User"}
            size={38}
            className="rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-[38px] h-[38px] rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "ST"}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 mb-0 leading-tight">
            {user?.name || "Staff"}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Staff</span>
        </div>
      </Link>
      </div>
    </div>
  );
}

export default StaffTopHeader;
