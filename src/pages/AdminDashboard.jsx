import { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function SecurityFrontDeskDashboard() {
  const { user, token } = useAuth();
  const [view, setView] = useState("daily"); // Default view: daily
  const [visitsChartData, setVisitsChartData] = useState([]); // Data for the line chart
  const [totalVisitorsToday, setTotalVisitorsToday] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(0);
  const [checkedOutToday, setCheckedOutToday] = useState(0);
  const [pendingToday, setPendingToday] = useState(0);
  const [loading, setLoading] = useState(false);

  const [priorityAlerts, setPriorityAlerts] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        console.log("No token available, skipping analytics fetch.");
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/admin/analytics?filter=${view}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        // Map the visits_chart_data to match recharts' expected dataKey 'visitors'
        const formattedChartData =
          (response.data.visits_chart_data || []).map((item) => ({
            date: item.date,
            visitors: item.visitors_count,
          })) || [];
        setVisitsChartData(formattedChartData);

        setTotalVisitorsToday(response.data.total_visitors_today);
        setCheckedInToday(response.data.checked_in_today);
        setCheckedOutToday(response.data.checked_out_today);
        setPendingToday(response.data.pending_today);
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error.response?.data || error.message
        );
        // Reset data on error
        setVisitsChartData([]);
        setTotalVisitorsToday(0);
        setCheckedInToday(0);
        setCheckedOutToday(0);
        setPendingToday(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [view, token]);

  // Fetch small set of priority alerts (top 3) for the dashboard
  useEffect(() => {
    const fetchPriorityAlerts = async () => {
      if (!token) return;
      setAlertsLoading(true);
      try {
        const response = await api.get("/admin/alerts/priority/quick", {
          params: { top: 3 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPriorityAlerts(response.data.alerts || []);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        toast.error("Failed to load priority alerts.");
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchPriorityAlerts();
  }, [token]);

  // Fetch latest visitors (small list for dashboard)
  useEffect(() => {
    const fetchLatestUpdates = async () => {
      if (!token) return;
      setUpdatesLoading(true);
      try {
        const response = await api.get("/admin/updates/latest", {
          params: { per_page: 3 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setLatestUpdates(response.data.visitors || []);
      } catch (error) {
        console.error("Failed to fetch latest visitors:", error);
        toast.error("Failed to load latest updates.");
      } finally {
        setUpdatesLoading(false);
      }
    };
    fetchLatestUpdates();
  }, [token]);

  // Build image helper: return visitor photo or default
  const visitorImage = (photo) => {
    if (!photo) return "./images/user1.png";
    // if photo is a full URL keep it, otherwise try to use the storage base
    if (photo.startsWith("http") || photo.startsWith("/")) return photo;
    return photo;
  };

  return (
    <div>
      <NavBar />
      <header
        id="#"
        className="text-white text-center position-relative px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "auto",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "20px",
          paddingBottom: "180px",
        }}
      >
        <div className="container mt-3">
          <div
            className="text-white p-4 shadow-sm text-center"
            style={{
              backgroundColor: "#053561",
              minHeight: "280px",
              borderRadius: "10px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">
                Welcome Back, {user?.name || "Admin"}
              </h3>
              {/* <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{ cursor: "pointer" }}
              ></i> */}
            </div>

            <div className="d-flex align-items-center  mt-2">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(57, 118, 175, 0.8)" }}
              >
                Sydani Group{" "}
                <span
                  className="badge text-light"
                  style={{ backgroundColor: "rgba(5, 53, 97, 0.8)" }}
                >
                  Company
                </span>
              </p>

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

        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-80px" }}
        >
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 justify-content-center">
            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-success-subtle">
                  <i className="bi bi-people fs-2 text-success"></i>
                </div>
                <div className="ms-auto  text-muted text-start">
                  <h6 className="mb-1">Visitors Today</h6>
                  <p className="mb-0 fs-4">{totalVisitorsToday}</p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-info-subtle">
                  <i className="bi bi-person-check fs-2 text-info"></i>
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1 text-muted">Checked In</h6>
                  <p className="mb-0 fs-4">{checkedInToday}</p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-warning-subtle">
                  <i className="bi bi-eye fs-2 text-warning"></i>
                </div>
                <div className="ms-auto text-start">
                  <h6 className="mb-1 text-muted">Checked Out</h6>
                  <p className="mb-0 fs-4">{checkedOutToday}</p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card p-4 d-flex flex-row align-items-center shadow rounded-3">
                <div className="p-2 rounded-3 bg-primary-subtle">
                  <i className="bi bi-hourglass fs-2 text-primary"></i>
                </div>
                <div className="ms-auto  text-start">
                  <h6 className="mb-1 text-muted">Pending</h6>
                  <p className="mb-0 fs-4">{pendingToday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        id="notifications"
        className="p-5"
        style={{ padding: "100px 0 50px 0" }}
      >
        <div className="row m-3" style={{ padding: "100px 0 20px 0" }}>
          <div className="col-md-6 pe-3 mt-5">
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
                <p className="text-center">Loading chart data...</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={visitsChartData}>
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

          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="lead">Priority Alerts</h6>
              <Link to="/admin-dashboard/alerts" className="text-primary">
                See all
              </Link>
            </div>

            <div className="row g-3">
              {alertsLoading ? (
                <div className="col-12 text-center">Loading...</div>
              ) : priorityAlerts.length === 0 ? (
                <div className="col-12 text-muted">No priority alerts</div>
              ) : (
                priorityAlerts.map((guest, index) => (
                  <div
                    key={guest.id ?? index}
                    className="col-9 col-sm-8 col-md-4 d-flex justify-content-between mb-3"
                  >
                    <div className="card mt-3 p-2 shadow-sm rounded-3">
                      <img
                        src={visitorImage(guest.visitor_photo)}
                        alt="Guest"
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                      <p
                        className="mt-2 mb-1 fw-bold"
                        style={{ minHeight: 30 }}
                      >
                        {guest.visitor_name || "Unknown"}
                      </p>
                      <small className="text-muted">
                        <span
                          className={`ms-2 ${
                            guest.status === "online"
                              ? "text-success me-3"
                              : "text-danger me-3"
                          }`}
                        >
                          ●
                        </span>
                        {guest.check_in
                          ? new Date(guest.check_in).toLocaleString()
                          : "No time"}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-5">
              <p className="lead">Latest Updates</p>
              <Link to="/admin-dashboard/updates" className="text-primary">
                See all
              </Link>
            </div>

            {updatesLoading ? (
              <p>Loading updates...</p>
            ) : latestUpdates.length === 0 ? (
              <p className="text-muted">No recent visitors</p>
            ) : (
              latestUpdates.map((u, idx) => (
                <div key={u.id ?? idx} className="col-12">
                  <div className="card p-3 shadow-sm d-flex flex-row align-items-center mb-3">
                    <img
                      src={visitorImage(u.photo)}
                      alt="Logo"
                      className="me-3"
                      width="40"
                      height="40"
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <p className="mb-1 text-dark">{u.name}</p>
                      <small className="text-muted">
                        {new Date(u.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


export default SecurityFrontDeskDashboard;
