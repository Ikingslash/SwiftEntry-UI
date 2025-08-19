import { useEffect, useState } from "react";
import api from "../../context/api";
import NavBar from "./include/NavBar";
import { toast } from 'react-toastify';
import { BellRing, UserCheck, CheckSquare } from 'lucide-react';
import { useNotifications } from "../../context/NotificationContext";
import { useLocation } from "react-router-dom";


function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("Loading notifications...");
  const [loading, setLoading] = useState(true);
  // Corrected the function name from markAllAsRead to markNotificationsAsRead
  const { markNotificationsAsRead, fetchNotificationCount } = useNotifications();
  const location = useLocation();

  // Function to fetch the paginated notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/staff/notifications");
      setLoading(false);

      if (response.data.notifications.data && Array.isArray(response.data.notifications.data)) {
        setNotifications(response.data.notifications.data);
        setMessage(response.data.message || "");
      } else {
        setNotifications([]);
        setMessage(response.data.message || "No Notifications Yet");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching notifications:", error);
      setMessage("An error occurred while loading notifications.");
      toast.error("An error occurred while loading notifications.");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // When the user navigates to the notifications page, mark all as read.
    if (location.pathname === "/staff-dashboard/notifications") {
      // Calling the correctly named function from the context
      markNotificationsAsRead();
      // Also, re-fetch the unread count in the context to sync it
      fetchNotificationCount();
    }
    
    // The real-time listener for new notifications is now handled in NotificationContext
    // so we don't need it here.

  }, [location, markNotificationsAsRead, fetchNotificationCount]);

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
      default:
        return 'text-secondary';
    }
  };
  
  // Get color for card background if it's unread
  const getCardBackgroundColor = (readAt) => {
    return readAt ? '#ffffff' : '#f0f4f8';
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
          <div className="row">
            {notifications.map((notification) => (
              <div key={notification.id} className="col-12 col-md-10 mx-auto mb-3">
                <div
                  className="card border-0 shadow-sm p-3 d-flex flex-column flex-md-row align-items-center"
                  style={{ borderRadius: "12px", backgroundColor: getCardBackgroundColor(notification.read_at) }}
                >
                  <div className="d-flex align-items-center w-100">
                    <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e9f5ff' }}>
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold text-dark">{notification.title || 'No Title'}</h6>
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
            ))}
          </div>
        ) : (
          <div className="text-center align-items-center p-5 text-muted">
            <img src="../images/notification_bucket.png"  width="400" height="400" alt="Notification" className="" />
            <h4  className="text-muted">{message}</h4>
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;
