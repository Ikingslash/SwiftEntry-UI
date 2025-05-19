
  import { useEffect, useState } from "react";
  import api from "../../context/api";
  import NavBar from "./include/NavBar";
  
  function FrontDeskNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await api.get("/front-desk/notifications");
          if (Array.isArray(response.data)) {
            setNotifications(response.data);
          } else {
            setMessage(response.data.message || "No Notifications Yet");
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setMessage("Failed to fetch notifications.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchNotifications();
    }, []);
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

              {/* Plus Icon (For Adding New FrontDeskNotifications) */}
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

            {/* Divider Line */}
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

      {/* FrontDeskNotifications List */}
      <section id="front-desk-notifications" className="container p-5">
      {loading ? (
          <p className="text-center">Loading...</p>
        ) : notifications.length > 0 ? (
          <div className="row">
          {notifications.map((notification, index) => (
            <div key={index} className="col-12 col-md-10 mx-auto mb-3">
              <div
                className="card border-0 shadow-sm p-3 d-flex flex-column flex-md-row align-items-center"
                style={{ borderRadius: "12px" }}
              >
                <div className="d-flex align-items-center w-100">
                  <img
                    src="../images/clock.png"
                    alt="Logo"
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                  />
                  <div className="flex-grow-1">
                    <p className="mb-2 fw-semibold text-muted" style={{ fontSize: "14px" }}>
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
                  className={`ms-md-3 ${
                    index % 2 === 0 ? "text-success" : "text-danger"
                  }`}
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

export default FrontDeskNotifications;
