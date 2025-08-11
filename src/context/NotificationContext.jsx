import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import api from "./api"; // Re-using your existing API instance

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch the unread count from the backend
  const fetchUnreadCount = async () => {
    try {
      // Use your existing API instance and the new endpoint
      const response = await api.get("/security/notifications/unread-count");
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
      setUnreadCount(0);
    }
  };

  // Function to mark all notifications as read
  const markNotificationsAsRead = async () => {
    try {
      await api.post("/security/notifications/mark-as-read");
      setUnreadCount(0); // Immediately update the UI
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Fetch the count on initial load and then every 60 seconds
  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markNotificationsAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => useContext(NotificationContext);
