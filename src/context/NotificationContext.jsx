import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "./api";
import echo from "./echo";
import { useAuth } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth(); // must have user.id and user.role ("staff" | "security")

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

  const markNotificationsAsRead = useCallback(async () => {
    if (!user || !rolePrefix) return;
    const prevCount = unreadCount; // keep old count in case of error
    setUnreadCount(0);
    try {
      await api.post(`/${rolePrefix}/notifications/mark-as-read`);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      setUnreadCount(prevCount); // revert if failed
    }
  }, [user, rolePrefix, unreadCount]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!user || !rolePrefix) return;
    try {
      await api.post(`/${rolePrefix}/notifications/mark-read`, {
        notification_id: notificationId,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [user, rolePrefix]);

  // Initial fetch
  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

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
      });

      return () => {
        echo.leave(`notifications.${user.id}`);
      };
    }
  }, [user]);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationContext);
}
