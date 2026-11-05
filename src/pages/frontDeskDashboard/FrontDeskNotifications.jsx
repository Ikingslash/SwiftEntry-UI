import { useEffect, useState } from "react";
import api from "../../context/api";
import { toast } from 'react-toastify';
import { BellRing, UserCheck, CheckSquare, Bell } from 'lucide-react';
import { useNotifications } from "../../context/NotificationContext";
import { useLocation } from "react-router-dom";
import FrontDeskTopHeader from "./include/FrontDeskTopHeader";


// Pagination component to display page numbers and navigation buttons.
const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page } = pagination;

  return (
    <nav className="mt-6 flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              current_page === 1
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            onClick={(e) => { e.preventDefault(); if (current_page > 1) handlePageChange(current_page - 1); }}
            disabled={current_page === 1}
          >
            Previous
          </button>
        </li>
        {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
          <li key={page}>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                current_page === page
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              current_page === last_page
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            onClick={(e) => { e.preventDefault(); if (current_page < last_page) handlePageChange(current_page + 1); }}
            disabled={current_page === last_page}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("Loading notifications...");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);  
  // Get functions from the NotificationContext
  const { markNotificationsAsRead, fetchNotificationCount } = useNotifications();
  const location = useLocation();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Corrected API endpoint for admin notifications
      const response = await api.get("/front-desk/notifications", {
        params: {
          page: currentPage,
          per_page: 10,
        },
      });

      // The backend now returns { notifications: [...], pagination: {...}, message: "..." }
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

    // Mark all notifications as read and update the count when navigating to this page (Point 4)
    if (location.pathname === "/front-desk-dashboard/notifications") {
      markNotificationsAsRead();
      fetchNotificationCount();
    }
  }, [currentPage, location, markNotificationsAsRead, fetchNotificationCount]); // Add new dependencies to the effect

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  // Function to get the appropriate icon based on notification category
  const getNotificationIcon = (category) => {
    switch (category) {
      case 'Visitor':
        return <UserCheck size={20} className="text-blue-600" />;
      case 'Registration':
        return <CheckSquare size={20} className="text-emerald-600" />;
      default:
        return <BellRing size={20} className="text-slate-600" />;
    }
  };

  // Function to get the appropriate color class based on notification status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-500';
      case 'Success':
        return 'text-emerald-500';
      case 'Scheduled':
        return 'text-blue-500';
      case 'Rescheduled':
        return 'text-blue-600';
      case 'Missed':
        return 'text-rose-500';
      case 'Cancelled':
        return 'text-rose-500';
      default:
        return 'text-slate-400';
    }
  };

  const getIconBg = (category) => {
    switch (category) {
      case 'Visitor':
        return 'bg-blue-50';
      case 'Registration':
        return 'bg-emerald-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7fc] pb-12">
      <FrontDeskTopHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-0">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with latest activities</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-8 text-center">
            <p className="text-slate-500 text-sm">{message}</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-2">
              {notifications.map((notification) => {
                const isUnread = !notification.is_read;

                return (
                  <div
                    key={notification.id}
                    className={`group relative bg-white rounded-2xl shadow-xs border transition-all duration-200 hover:shadow-sm hover:border-slate-200 ${
                      isUnread 
                        ? 'border-blue-200 bg-blue-50/30' 
                        : 'border-slate-100'
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getIconBg(notification.category)} flex items-center justify-center`}>
                        {getNotificationIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h6 className={`text-sm mb-1 ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {notification.title || 'No Title'}
                            </h6>
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              {notification.message || "No message"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {notification.created_at
                                ? new Date(notification.created_at).toLocaleString()
                                : "Just now"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`${getStatusColor(notification.status)} text-lg leading-none`}>
                              ●
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
            {pagination.last_page > 1 && (
              <Pagination pagination={pagination} handlePageChange={handlePageChange} />
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No notifications</h3>
            <p className="text-slate-500 text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;
