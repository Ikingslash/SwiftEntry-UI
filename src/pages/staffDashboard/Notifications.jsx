
import { useEffect, useState } from "react";
import StaffTopHeader from "./include/StaffTopHeader";
import api from "../../context/api";
import { useNotifications } from "../../context/NotificationContext";
import echo from "../../context/echo";
import { toast } from 'react-toastify';
import { BellRing, UserCheck, CheckSquare } from 'lucide-react';
import { useLocation } from "react-router-dom";







// Pagination component to display page numbers and navigation buttons.
const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page } = pagination;
  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation" className="mt-5">
      <div className="flex items-center justify-center gap-1 overflow-x-auto max-w-full pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className="px-3 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            className={`min-w-9 h-9 px-2 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border shrink-0 ${
              current_page === page
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="px-3 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
        >
          Next
        </button>
      </div>
    </nav>
  );
};



function Notifications() {
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
    const response = await api.get("/staff/notifications", {
      params: {
        page,          // ✅ use the function param, not currentPage
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
    if (location.pathname === "/staff-dashboard/notifications") {
      markNotificationsAsRead();
      fetchNotificationCount();
    }

    // ✅ Listen for real-time pushes
    const channel = echo.private(
      `notifications.${localStorage.getItem("user_id")}`
    );
    channel.listen(".new-notification", (event) => {
      setNotifications((prev) => [event.notification, ...prev]);
      // addNotification(event.notification); // Removed undefined function call
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
        case 'Visitor':
          return <UserCheck size={28} />;
        case 'Registration':
          return <CheckSquare size={28} />;
        default:
          return <BellRing size={28} />;
      }
    };

    // Function to get the appropriate color class based on notification status
    const getStatusColor = (status) => {
      switch (status) {
        case 'Pending':
          return 'text-warning';
        case 'Success':
          return 'text-success';
        case 'Scheduled':
          return 'text-info'; // Example color for 'Scheduled'
        case 'Rescheduled':
          return 'text-primary'; // Example color for 'Rescheduled'
        case 'Missed':
          return 'text-danger'; // Example color for 'Missed'
        case 'Cancelled':
          return 'text-danger'; // Example color for 'Cancelled'
        default:
          return 'text-secondary';
      }
    };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <StaffTopHeader />

      {/* Header Container */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Notifications
        </p>
        <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
          Stay updated with latest activities.
        </p>
      </div>

      <section id="notifications" className="max-w-[1140px] mx-auto px-4">
        {loading ? (
          <p className="text-center text-sm text-slate-500">{message}</p>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl shadow-xs border border-slate-100 px-4 py-3 flex items-start gap-3"
                >
                  <div className="p-2 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="mb-1 font-bold text-slate-900 text-xs">
                      {notification.title || "No Title"}
                    </h6>
                    <p className="mb-0 text-slate-500 text-[11px] leading-relaxed">
                      {notification.message || "No message"}
                    </p>
                    <small className="text-slate-400 text-[10px]">
                      {notification.created_at
                        ? new Date(notification.created_at).toLocaleString()
                        : "Just now"}
                    </small>
                  </div>
                  <span
                    className={`shrink-0 mt-1 ${getStatusColor(notification.status)}`}
                    style={{ fontSize: "14px" }}
                  >
                    ●
                  </span>
                </div>
              ))}
            </div>
            {pagination.last_page > 1 && (
              <Pagination
                pagination={pagination}
                handlePageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-10 text-center">
            <h4 className="text-slate-400 text-sm font-medium">{message}</h4>
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;
