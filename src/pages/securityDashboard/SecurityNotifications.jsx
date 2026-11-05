import { useEffect, useState } from "react";
import api from "../../context/api";
import { useNotifications } from "../../context/NotificationContext";
import echo from "../../context/echo";
import { toast } from "react-toastify";
import { BellRing, UserCheck, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

// Pagination component to display page numbers and navigation buttons.
const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page } = pagination;
  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    pages.push(i);
  }

  const btnBase =
    "min-w-9 h-9 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center";

  return (
    <nav aria-label="Page navigation" className="mt-4">
      <ul className="flex flex-wrap items-center justify-center gap-2 list-none p-0 m-0">
        <li>
          <button
            type="button"
            disabled={current_page === 1}
            onClick={() => handlePageChange(current_page - 1)}
            className={`${btnBase} bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </li>
        {pages.map((page) => (
          <li key={page}>
            <button
              type="button"
              onClick={() => handlePageChange(page)}
              className={`${btnBase} ${
                current_page === page
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={current_page === last_page}
            onClick={() => handlePageChange(current_page + 1)}
            className={`${btnBase} bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

function SecurityNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("Loading notifications...");
  const [pagination, setPagination] = useState({}); // State for pagination data
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  // Get functions from the NotificationContext
  const location = useLocation();
  const { markNotificationsAsRead, fetchNotificationCount } = useNotifications();

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/security/notifications", {
        params: {
          page, // ✅ use the function param, not currentPage
          per_page: 10,
        },
      });
      if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination ?? {});
        setMessage(response.data.message || "Notifications fetched successfully.");
        if (response.data.notifications.length === 0) {
          setMessage("No Notifications Yet");
        }
      } else {
        setNotifications([]);
        setPagination({});
        setMessage(response.data.message || "No Notifications Yet");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setPagination({});
      setMessage("An error occurred while loading notifications.");
      toast.error("An error occurred while loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Mark notifications as read and update the count when navigating to this page
    if (location.pathname === "/security-dashboard/notifications") {
      markNotificationsAsRead();
      fetchNotificationCount();
    }

    // ✅ Listen for real-time pushes
    const channel = echo.private(
      `notifications.${localStorage.getItem("user_id")}`
    );
    channel.listen(".new-notification", (event) => {
      setNotifications((prev) => [event.notification, ...prev]);
    });

    return () => {
      echo.leave(`notifications.${localStorage.getItem("user_id")}`);
    };
  }, [currentPage, location, markNotificationsAsRead, fetchNotificationCount]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.last_page) {
      setCurrentPage(page);
      fetchNotifications(page); // ✅ call fetch with the new page
    }
  };

  // Function to get the appropriate icon based on notification category
  const getNotificationIcon = (category) => {
    switch (category) {
      case "Visitor":
        return <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Registration":
        return <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  // Function to get the appropriate color class based on notification status
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500";
      case "Success":
        return "bg-emerald-500";
      case "Scheduled":
        return "bg-sky-500";
      case "Rescheduled":
        return "bg-blue-500";
      case "Missed":
        return "bg-rose-500";
      case "Cancelled":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Notifications
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Stay updated with the latest visitor activity.
        </p>
      </div>

      <section
        id="notifications"
        className="max-w-[1140px] mx-auto px-4 sm:px-6"
      >
        {loading ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-10 flex items-center justify-center gap-3">
            <span className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500 mb-0">{message}</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-2.5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl shadow-xs border border-slate-100 px-4 py-3.5 flex items-start gap-3"
                >
                  <div className="p-2 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="grow min-w-0">
                    <h6 className="mb-1 font-bold text-slate-900 text-xs">
                      {notification.title || "No Title"}
                    </h6>
                    <p className="mb-1 text-slate-500 text-[11px] leading-relaxed break-words">
                      {notification.message || "No message"}
                    </p>
                    <small className="text-slate-400 text-[10px]">
                      {notification.created_at
                        ? new Date(notification.created_at).toLocaleString()
                        : "Just now"}
                    </small>
                  </div>
                  <span
                    className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${getStatusColor(
                      notification.status
                    )}`}
                    title={notification.status}
                  />
                </div>
              ))}
            </div>
            <Pagination
              pagination={pagination}
              handlePageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <BellRing className="w-6 h-6" />
            </div>
            <h4 className="text-slate-500 text-sm font-semibold mb-1">
              {message}
            </h4>
            <p className="text-slate-400 text-[11px] mb-0">
              New visitor updates will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default SecurityNotifications;
