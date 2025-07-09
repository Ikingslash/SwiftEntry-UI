import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { useAuth } from "../context/AuthContext";
import api from "../context/api";
import NavBar from "./admin/include/NavBar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function SecurityFrontDeskDashboard() {
  const { user, token } = useAuth();
  const [view, setView] = useState("weekly"); // Default view
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return; // Prevent API call if token is missing
      setLoading(true);
      try {
        const response = await api.get(`/admin/analytics?filter=${view}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data); // Debugging log
        setChartData(response.data); // Ensure response structure matches expected format
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [view, token]);

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
                  backgroundColor: "rgba(57, 118, 175, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light"
                  style={{
                    backgroundColor: "rgba(5, 53, 97, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>

              {/* Extending Line */}
              <div
                className="flex-grow-1 ms-3"
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
          <div className="row row-cols-md-4 g-3 justify-content-center">
            {/* Total Visitors */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-success-subtle">
                  <i className="bi bi-people fs-2 text-success"></i>
                </div>
                <div className="ms-auto  text-muted text-start">
                  <h6 className="mb-1">Visitors Today</h6>
                  <p className="mb-0 fs-4">25</p>
                </div>
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-info-subtle">
                  <i className="bi bi-person-check fs-2 text-info"></i>
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1 text-muted">Checked In</h6>
                  <p className="mb-0 fs-4">20</p>
                </div>
              </div>
            </div>

            {/* Pending Guest */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-warning-subtle">
                  <i className="bi bi-eye fs-2 text-warning"></i>
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1 text-muted">Checked Out</h6>
                  <p className="mb-0 fs-4">12</p>
                </div>
              </div>
            </div>
            {/* Pending Guest */}
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-primary-subtle">
                  <i className="bi bi-eye fs-2 text-primary"></i>
                </div>
                <div className="ms-auto  text-start">
                  <h6 className="mb-1 text-muted">Pending</h6>
                  <p className="mb-0 fs-4">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Message From The Head Of School */}
      <section
        id="notifications"
        className="p-5"
        style={{ padding: "100px 0 50px 0" }}
      >
        <div className="row m-3" style={{ padding: "100px 0 20px 0" }}>
          {/* Left Column - Recent */}
          <div className="col-md-6 pe-3 mt-5">
            {/* Line Chart */}
            <div className="card p-4">
              <div className="text-center">
                <select
                  className="form-select rounded-pill border-secondary bg-light my-2"
                  style={{ maxWidth: "100px" }}
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {loading ? (
                <p className="text-center">Loading...</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#007bff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Right Column - Today's Guests */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="lead">Priority Alerts</h6>
            </div>

            {/* Guest Cards (3 in a Row) */}
            <div className="row g-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="col-9 col-sm-8 col-md-4 d-flex justify-content-between mb-3"
                >
                  <div className="card mt-3 p-2 shadow-sm rounded-3">
                    <img src="./images/user1.png" alt="Guest" className="" />
                    <p className="mt-2 mb-1 fw-bold">Guest Name</p>
                    <small className="text-muted">
                      {" "}
                      <span
                        className={`ms-2 ${
                          index % 2 === 0
                            ? "text-success me-3"
                            : "text-danger me-3"
                        }`}
                      >
                        ●
                      </span>
                      10:30 AM
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Notification Cards */}
            <div className="d-flex justify-content-between align-items-center mt-5">
              <p className="lead">Latest Updates</p>
              <a href="#" className="text-primary">
                See all
              </a>
            </div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="col-12">
                <div className="card p-3 shadow-sm d-flex flex-row align-items-center mb-3">
                  <img
                    src="./images/clock.png"
                    alt="Logo"
                    className="me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <p className="mb-1 text-dark">
                      Reminder Title: You have 3 Guest arriving today
                    </p>
                    <small className="text-muted">Today | 2 min ago</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SecurityFrontDeskDashboard;
