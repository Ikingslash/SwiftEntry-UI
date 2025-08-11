import { useEffect, useState } from "react";
import NavBar from "./include/NavBar";
import api from "../../context/api";
import { useNotifications } from "../../context/NotificationContext"; 


function SecurityNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { markNotificationsAsRead } = useNotifications(); // Access the function to clear the count

  useEffect(() => {
    fetchNotifications();
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("security/notifications", {
        params: {
          per_page: 10,
          page: page,
        },
      });
      setNotifications(response.data.notifications || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <header
        id="#"
        className="text-white text-center d-flex align-items-center px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "250px",
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
            {/* Header Content */}
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Notifications</h3>
              <i
                className="bi bi-plus-circle fs-1 text-white-50 p-2"
                style={{
                  cursor: "pointer",
                  transition: "0.3s",
                }}
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

      {/* SecurityNotifications List */}
      <section id="front-desk-notifications" className="container p-5">
        <div className="row">
          {loading ? (
            <p className="text-center">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center">No notifications found.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="col-12 col-md-10 mx-auto mb-3"
              >
                <div
                  className={`card border-0 shadow-sm p-3 d-flex flex-column flex-md-row align-items-center ${!notification.read_at ? 'bg-light' : ''}`}
                  style={{
                    borderRadius: "12px",
                  }}
                >
                  {/* Left: Image & Details */}
                  <div className="d-flex align-items-center w-100">
                    <img
                      src="../images/clock.png"
                      alt="Notification Icon"
                      className="rounded-circle me-3"
                      width="50"
                      height="50"
                    />
                    <div className="flex-grow-1">
                      <p
                        className="mb-2 fw-semibold"
                        style={{
                          fontSize: "14px",
                          color: !notification.read_at ? '#000' : '#6c757d', // Bold/darker text for unread
                        }}
                      >
                        {notification.title} - {notification.message}
                      </p>
                      <small className="text-muted">
                        {notification.timestamp}
                      </small>
                    </div>
                  </div>

                  {/* Right: Notification Indicator */}
                  {!notification.read_at && (
                     <span className="ms-md-3 text-primary" style={{ fontSize: "18px" }}>●</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default SecurityNotifications;
