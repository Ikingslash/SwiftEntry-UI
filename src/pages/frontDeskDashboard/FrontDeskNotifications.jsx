import { useEffect, useState } from "react";
import api from "../../context/api";
import NavBar from "./include/NavBar";
import { toast } from 'react-toastify';
import { BellRing, UserCheck, CheckSquare } from 'lucide-react';
import { useNotifications } from "../../context/NotificationContext";
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
    <nav aria-label="Page navigation" className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(current_page - 1); }}
          >
            Previous
          </a>
        </li>
        {pages.map(page => (
          <li key={page} className={`page-item ${current_page === page ? 'active' : ''}`}>
            <a
              className="page-link"
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
            >
              {page}
            </a>
          </li>
        ))}
        <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(current_page + 1); }}
          >
            Next
          </a>
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
        setPagination(response.data.pagination);
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
        return 'text-info';
      case 'Rescheduled':
        return 'text-primary';
      case 'Missed':
        return 'text-danger';
      case 'Cancelled':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div>
      <NavBar />
      <header
        className="text-white text-center d-flex align-items-center px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "300px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white p-4 shadow-sm rounded"
            style={{
              backgroundColor: "#053561",
              minHeight: "160px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Notifications</h3>
              <i
                className="bi bi-plus-circle fs-1 text-white-50 p-2"
                style={{ cursor: "pointer", transition: "0.3s" }}
                onMouseOver={(e) => (e.target.style.color = "#0d6efd")}
                onMouseOut={(e) => (e.target.style.color = "white")}
              ></i>
            </div>

            <div
              className="w-100 mt-3"
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
              }}
            ></div>
          </div>
        </div>
      </header>

      <section id="notifications" className="container p-4">
        {loading ? (
          <p className="text-center">{message}</p>
        ) : notifications.length > 0 ? (
          <>
            <div className="row">
              {notifications.map((notification) => {
                // Point 4: Visual distinction for unread notifications
                const isUnread = !notification.is_read;
                const cardStyle = {
                    borderRadius: "12px",
                    // Use a subtle background color or highlight for unread
                    backgroundColor: isUnread ? '#f0f8ff' : 'white', // Light blue for unread
                    borderLeft: isUnread ? '4px solid #007bff' : '1px solid #e9ecef',
                    transition: 'background-color 0.3s',
                    cursor: 'pointer',
                };

                return (
                <div key={notification.id} className="col-12 col-md-10 mx-auto mb-3">
                  <div
                    className="card border-0 shadow-sm p-3 d-flex flex-column flex-md-row align-items-center"
                    style={cardStyle} // Apply dynamic style
                  >
                    <div className="d-flex align-items-center w-100">
                      <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e9f5ff' }}>
                        {getNotificationIcon(notification.category)}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className={`mb-1 ${isUnread ? 'fw-bold text-dark' : 'text-secondary'}`}>
                            {notification.title || 'No Title'}
                        </h6>
                        <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                          {notification.message || "No message"}
                        </p>
                        <small className="text-muted">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : "Just now"}
                        </small>
                      </div>
                    </div>
                    <span
                      className={`ms-md-3 mt-3 mt-md-0 ${getStatusColor(notification.status)}`}
                      style={{ fontSize: "18px" }}
                    >
                      ●
                    </span>
                  </div>
                </div>
              )})}
            </div>
            {pagination.last_page > 1 && (
              <Pagination pagination={pagination} handlePageChange={handlePageChange} />
            )}
          </>
        ) : (
          <div className="text-center align-items-center p-5 text-muted">
            <img src="https://placehold.co/400x400/E9F5FF/053561?text=No+Notifications" width="400" height="400" alt="Notification" className="img-fluid" />
            <h4 className="text-muted">{message}</h4>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminNotifications;
