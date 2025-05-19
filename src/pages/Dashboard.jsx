import { useState, useEffect } from "react"; 
import NavBar from "./staffDashboard/include/NavBar";
import { useAuth } from "../context/AuthContext";
import api from "../context/api";
// import Notifications from "./staffDashboard/Notifications";

function Dashboard() { 
    const { user, token } = useAuth();
  
    const [recents, setRecents] = useState([]);
    const [todaysGuests, setTodaysGuests] = useState([]);
    const [notifications, setNotifications] = useState([]);
  
    // Fetch all data on mount
    useEffect(() => {
      if (!token) return;
  
      const fetchDashboardData = async () => {
        try {
          const [recentsRes, guestsRes, notifRes] = await Promise.all([
            api.get("/staff/dashboard/recents", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/staff/dashboard/todays-guests", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/staff/notifications", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
  
          setRecents(recentsRes.data.recents || []);
          setTodaysGuests(guestsRes.data.todays_guests || []);
          setNotifications(
            notifRes.data.notifications || [{ message: notifRes.data.message }]
          );
        } catch (error) {
          console.error("Dashboard fetch error:", error);
        }
      };
  
      fetchDashboardData();
    }, [token]);
  

  return (
    <div>
      <NavBar />

      {/* Hero Section */}
      <header
        id="#"
        className="text-white text-center position-relative px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "auto", // Remove fixed min-height
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "20px", // Add some top padding
          paddingBottom: "180px", // Adjusted padding to accommodate cards
        }}
      >
        {/* Left Content */}
        <div className="container mt-3">
          <div
            className="text-white p-4 shadow-sm text-center"
            style={{
              backgroundColor: "#053561",
              minHeight: "280px",
              borderRadius: "10px",
            }}
          >
            {/* Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Welcome Back, {user?.name}</h3>

              {/* Plus Icon */}
              <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center  mt-2">
              {/* Badge */}
              <p
                className="badge text-white"
                style={{
                  backgroundColor: "rgba(25, 88, 148, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{
                    backgroundColor: "rgba(13, 46, 78, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>

              {/* Extending Line */}
              <div
                className="flex-grow-1 ms-3 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Core Values Section - Cards on Top of Header */}
        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-80px" }}
        >
          <div className="row row-cols-1 row-cols-md-3 g-3 justify-content-center">
            {/* Total Visitors */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-3 rounded-circle bg-primary-subtle">
                  <i className="bi bi-people fs-3 text-primary"></i>
                </div>
                <div className="ms-auto text-end">
                  <h6 className="mb-1 text-muted">Total Visitors Today</h6>
                  <p className="mb-0 fs-5 fw-bold">12</p>
                </div>
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-3 rounded-circle bg-primary-subtle">
                  <i className="bi bi-person-check fs-3 text-primary"></i>
                </div>
                <div className="ms-auto text-end">
                  <h6 className="mb-1 text-muted">Upcoming Visits</h6>
                  <p className="mb-0 fs-5 fw-bold">20</p>
                </div>
              </div>
            </div>

            {/* Pending Guest */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-3 rounded-circle bg-primary-subtle">
                  <i className="bi bi-eye fs-3 text-primary"></i>
                </div>
                <div className="ms-auto text-end">
                  <h6 className="mb-1 text-muted">Pending Guest</h6>
                  <p className="mb-0 fs-5 fw-bold">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Message From The Head Of School */}
      <section className="container p-5" style={{ padding: "100px 0 50px 0" }}>
        <div className="row m-3" style={{ padding: "100px 0 20px 0" }}>
          {/* Left Column - Recents */}
          <div className="col-md-6 pe-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Recent</h5>
              <a href="#" className="text-primary">
                See all
              </a>
            </div>

            <div className="row g-3">
              {recents.length > 0 ? (
                recents.slice(0, 7).map((item) => (
                  <div key={item.id} className="col-12">
                    <div className="card p-3 shadow-sm d-flex flex-row align-items-center">
                      <img
                        src="./images/clock.png"
                        alt="Logo"
                        className="me-3"
                        width="40"
                        height="40"
                      />
                      <div>
                        <p className="mb-1 fw-bold text-dark">
                          {item.visitor.name} - {item.purpose}
                        </p>
                        <small className="text-muted">
                          Scheduled at {new Date(item.check_in).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent visits</p>
              )}
            </div>
          </div>

          {/* Right Column - Today's Guests */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center py-4">
              <h5 className="fw-bold">Today's Guests</h5>
              <a href="#" className="text-primary">
                See more
              </a>
            </div>

          {/* Guest Cards (3 in a Row) */}
<div className="row g-3">
  {todaysGuests.length === 0 ? (
    <p className="text-muted">No guests for today.</p>
  ) : (
    todaysGuests.slice(0, 3).map((guest, index) => (
      <div
        key={guest.id}
        className="col-9 col-sm-8 col-md-4 d-flex justify-content-between mb-3"
      >
        <div className="card p-2 m-2 shadow-sm rounded-3 text-center">
          <img src="./images/user1.png" alt="Guest" />
          <p className="mt-2 mb-1 fw-bold">{guest.name}</p>
          <small className="text-muted">
            <span
              className={`ms-2 ${
                index % 2 === 0 ? "text-success me-3" : "text-danger me-3"
              }`}
            >
              ●
            </span>
            {guest.check_in || "No time"}
          </small>
        </div>
      </div>
    ))
  )}
</div>


            {/* Notifications */}
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div key={index} className="card mb-3 p-3 shadow-sm">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src="./images/user.png"
                        alt="User"
                        className="rounded-circle me-3"
                        width="40"
                        height="40"
                      />
                      <div>
                        <p className="mb-1 fw-bold">
                          {notif.title || "System Notification"}
                        </p>
                        <small className="text-muted">
                          {notif.message || "No message details"}
                        </small>
                      </div>
                    </div>
                    <i className="bi bi-arrow-up-right text-primary fs-4"></i>
                  </div>
                </div>
              ))
            ) : (
              <p>No notifications</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
