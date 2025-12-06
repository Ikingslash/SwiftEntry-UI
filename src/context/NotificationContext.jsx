import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "./api";
import echo from "./echo";
import { useAuth } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestUnread, setLatestUnread] = useState([]); 
  const { user } = useAuth();

  // Function to determine base endpoint based on role
  const getRolePrefix = useCallback((role) => {
    switch (role) {
      case "staff":
        return "staff";
      case "front_desk":
        return "front-desk";
      case "security":
        return "security";
      case "admin":
        return "admin";
      default:
        return null;
    }
  }, []);

  const rolePrefix = getRolePrefix(user?.role);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const fetchNotificationCount = useCallback(async () => {
    if (!user || !rolePrefix) return;
    try {
      const response = await api.get(`/${rolePrefix}/notifications/unread-count`);
      setUnreadCount(response.data.unread_count ?? response.data.count ?? 0);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }, [user, rolePrefix]);

  // 👈 NEW FUNCTION: Fetch the top 3 unread notifications for the dropdown
  const fetchLatestUnread = useCallback(async () => {
    if (!user || !rolePrefix) return;
    try {
      const response = await api.get(`/${rolePrefix}/notifications/latest-unread`);
      setLatestUnread(response.data.latest_unread_notifications || []);
    } catch (error) {
      console.error("Error fetching latest unread notifications:", error);
    }
  }, [user, rolePrefix]);


  const markNotificationsAsRead = useCallback(async () => {
    if (!user || !rolePrefix) return;
    const prevCount = unreadCount;
    setUnreadCount(0);
    try {
      // Changed from 'mark-as-read' to 'mark-all-read'
      await api.post(`/${rolePrefix}/notifications/mark-all-read`);
      setLatestUnread([]);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      setUnreadCount(prevCount);
    }
  }, [user, rolePrefix, unreadCount]);


  const markAsRead = useCallback(async (notificationId) => {
    if (!user || !rolePrefix) return;
    try {
      await api.post(`/${rolePrefix}/notifications/mark-read`, {
        notification_id: notificationId,
      });
      // Refresh count and dropdown after marking one as read
      fetchNotificationCount();
      fetchLatestUnread();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [user, rolePrefix, fetchNotificationCount, fetchLatestUnread]); // 👈 Added dependencies

  // Initial fetch
  useEffect(() => {
    fetchNotificationCount();
    fetchLatestUnread(); // 👈 Fetch dropdown list on load
  }, [fetchNotificationCount, fetchLatestUnread]);

  // Real-time updates
  useEffect(() => {
    if (user?.id) {
      const channel = echo.private(`notifications.${user.id}`);
      channel.listen(".new-notification", (event) => {
        console.log("📢 New notification:", event);
        addNotification(event.notification);
        setUnreadCount((prev) =>
          event.unreadCount !== undefined ? event.unreadCount : prev + 1
        );
        fetchLatestUnread(); // 👈 Refresh dropdown on new notification
      });

      return () => {
        echo.leave(`notifications.${user.id}`);
      };
    }
  }, [user, fetchLatestUnread]); // 👈 Added dependency

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotificationCount,
        addNotification,
        clearNotifications,
        markNotificationsAsRead,
        markAsRead,
        setUnreadCount,
        latestUnread, // 👈 Export latest unread list
        fetchLatestUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationContext);
}
