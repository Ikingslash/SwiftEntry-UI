import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import React, { useState, useEffect } from "react";
import NavBar from "../include/NavBar";
import api from "../../../context/api"; // Assuming your Axios instance

function AnalyticalAndReport() {
  const [analyticsData, setAnalyticsData] = useState({
    visits_chart_data: [],
    total_visitors_today: 0,
    checked_in_today: 0,
    checked_out_today: 0,
    pending_today: 0,
    most_visited_staff: [],
    peak_visitor_hours: [],
    visitor_types: [],
    purpose_of_visit: [],
    most_frequent_visitors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // Default export format
  const [showFilterModal, setShowFilterModal] = useState(false); // State for filter modal
  const [isExporting, setIsExporting] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    timePeriod: 'daily', // 'daily', 'weekly', 'monthly'
    vip: false,
    blacklist: false,
    walkins: false,
    preregistered: false,
  });

  // Colors for Pie Charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884d8", "#82ca9d", "#ffc658"];

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [activeFilters]); // Dependency array includes all active filters

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('filter', activeFilters.timePeriod);
      if (activeFilters.vip) queryParams.append('vip', true);
      if (activeFilters.blacklist) queryParams.append('blacklist', true);
      if (activeFilters.walkins) queryParams.append('walkins', true);
      if (activeFilters.preregistered) queryParams.append('preregistered', true);

      const response = await api.get(`/admin/analytics?${queryParams.toString()}`);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error("Error fetching analytics data:", err.response?.data || err.message);
      setError("Failed to load analytics data. Please try again.");
      setAnalyticsData({ // Reset to initial state on error
        visits_chart_data: [],
        total_visitors_today: 0,
        checked_in_today: 0,
        checked_out_today: 0,
        pending_today: 0,
        most_visited_staff: [],
        peak_visitor_hours: [],
        visitor_types: [],
        purpose_of_visit: [],
        most_frequent_visitors: [],
      });
    } finally {
      setLoading(false);
    }
  };

const handleExport = async () => {
  setIsExporting(true);
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("format", exportFormat);
    queryParams.append("filter", activeFilters.timePeriod || "daily");

    if (activeFilters.vip) queryParams.append("vip", true);
    if (activeFilters.blacklist) queryParams.append("blacklist", true);
    if (activeFilters.walkins) queryParams.append("walkins", true);
    if (activeFilters.preregistered) queryParams.append("preregistered", true);

    // ✅ FIXED: Ensure you call the correct backend route (with full path)
    window.open(
      `${
        import.meta.env.VITE_API_BASE_URL || ""
      }/api/admin/analytics/export?${queryParams.toString()}`,
      "_blank"
    );

      // give small delay before closing modal
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      alert(`Exporting report as ${exportFormat.toUpperCase()}...`);
    }, 1200);
  } catch (err) {
    console.error("Error exporting report:", err.response?.data || err.message);
    alert("Failed to export report. Please try again.");
  }
};

  const handleFilterChange = (filterType, value) => {
    // This function updates the activeFilters state.
    // The useEffect hook, which depends on activeFilters, will then trigger fetchAnalyticsData.
    if (filterType === "timePeriod") {
      setActiveFilters((prev) => ({ ...prev, timePeriod: value }));
    } else {
      setActiveFilters((prev) => ({
        ...prev,
        [filterType]: !prev[filterType]
      }));
    }
  };

  const handleApplyFilters = () => {
    // This button explicitly triggers a data fetch with the current filters
    // and closes the modal.
    fetchAnalyticsData();
    setShowFilterModal(false);
  };

  

  if (loading) {
    return <p className="text-center mt-5">Loading analytics data...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "270px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">Analytical Reports</h3>

              {/* Removed duplicate Export Button from header */}
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
                Sydani Group{" "}
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
      </header>

      {/* Dashboard Cards Section */}
      <div className="container" style={{ marginTop: "-90px" }}>
        <div className="row g-3 justify-content-center">
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="card shadow-sm p-3 text-center rounded-4 border-0">
              <h6 className="text-muted">Total Visitors Today</h6>
              <h3 className="fw-bold text-primary">
                {analyticsData.total_visitors_today}
              </h3>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="card shadow-sm p-3 text-center rounded-4 border-0">
              <h6 className="text-muted">Checked In Today</h6>
              <h3 className="fw-bold text-success">
                {analyticsData.checked_in_today}
              </h3>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="card shadow-sm p-3 text-center rounded-4 border-0">
              <h6 className="text-muted">Checked Out Today</h6>
              <h3 className="fw-bold text-info">
                {analyticsData.checked_out_today}
              </h3>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="card shadow-sm p-3 text-center rounded-4 border-0">
              <h6 className="text-muted">Pending Today</h6>
              <h3 className="fw-bold text-warning">
                {analyticsData.pending_today}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="container mt-5">
        {/* Filter and Export Buttons (moved here as per screenshot) */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            type="button" // Explicitly set type to button
            className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
            onClick={() => setShowFilterModal(true)}
          >
            <i className="bi bi-sliders2"></i> Apply Filters
          </button>
          <button
            type="button" // Explicitly set type to button
            className="btn btn-primary rounded-pill d-flex align-items-center gap-2"
            onClick={() => setShowExportModal(true)}
          >
            <i className="bi bi-box-arrow-up"></i> Export Report
          </button>
        </div>

        <div className="row p-3">
          {/* Left Column for Charts */}
          <div className="col-md-6 mb-4 p-3">
            {/* Visitors Tariff (Line Chart) */}
            <h5 className="mb-3">Visitors Tariff</h5>
            <div className="card p-2 shadow-sm rounded-4 border-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analyticsData.visits_chart_data.map((d) => ({
                    ...d,
                    date: new Date(d.date).toLocaleDateString(),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visitors_count" // Use visitors_count from backend
                    stroke="#007bff"
                    strokeWidth={2}
                    name="Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Visitor Type Graph (Pie Chart) */}
            <h5 className="mt-5 mb-3">Visitor Type Distribution</h5>
            <div className="card p-2 shadow-sm rounded-4 border-0">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.visitor_types}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count" // Use 'count' from backend
                    nameKey="visitor_type" // Use 'visitor_type' from backend
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {analyticsData.visitor_types.map((entry, index) => (
                      <Cell
                        key={`cell-visitor-type-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Purpose of Visit Analysis (Pie Chart) */}
            <h5 className="mt-5 mb-3">Purpose of Visit Analysis</h5>
            <div className="card p-2 shadow-sm rounded-4 border-0">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.purpose_of_visit}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#82ca9d"
                    dataKey="count" // Use 'count' from backend
                    nameKey="purpose" // Use 'purpose' from backend
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {analyticsData.purpose_of_visit.map((entry, index) => (
                      <Cell
                        key={`cell-purpose-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column for Charts and Lists */}
          <div className="col-md-6 mb-4 p-3">
            {/* Most Visited Staff (Progress Bars) */}
            <h5 className="mb-3">Most Visited Staff</h5>
            <div className="card p-4 shadow-sm rounded-4 border-0">
              {analyticsData.most_visited_staff.length === 0 ? (
                <p className="text-center text-muted">
                  No data for most visited staff.
                </p>
              ) : (
                analyticsData.most_visited_staff.map((staff, index) => (
                  <div key={`staff-${index}`} className="mb-3">
                    <p className="mb-1 fw-bold">{staff.name}</p>
                    <div
                      className="progress"
                      style={{ height: "8px", borderRadius: "5px" }}
                    >
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${staff.visits_count}%`, // Use visits_count
                          backgroundColor: COLORS[index % COLORS.length],
                          borderRadius: "5px",
                        }}
                        aria-valuenow={staff.visits_count}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <p className="mt-1 text-end text-muted small">
                      {staff.visits_count} visits
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Peak Visitors Hour (Line Chart) */}
            <h5 className="mt-5 mb-3">Peak Visitors Hour</h5>
            <div className="card p-2 shadow-sm rounded-4 border-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analyticsData.peak_visitor_hours.map((d) => ({
                    ...d,
                    hour: `${d.hour}:00`,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count" // Use 'count' from backend
                    stroke="#FF8042"
                    strokeWidth={3}
                    name="Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Most Frequent Visitors (Cards) */}
            <h5 className="mt-5 mb-3">Most Frequent Visitors</h5>
            <div className="card p-2 shadow-sm rounded-4 border-0">
              <div className="row p-4 g-3">
                {analyticsData.most_frequent_visitors.length === 0 ? (
                  <p className="text-center text-muted">
                    No data for most frequent visitors.
                  </p>
                ) : (
                  analyticsData.most_frequent_visitors.map((visitor, index) => (
                    <div
                      className="col-md-4 col-sm-6"
                      key={`frequent-visitor-${index}`}
                    >
                      <div className="card bg-light text-center p-3 rounded-3 border">
                        {/* Profile Image */}
                        <div className="d-flex justify-content-center">
                          <div
                            className="rounded-circle border border-success d-flex justify-content-center align-items-center"
                            style={{
                              width: "100px",
                              height: "100px",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <img
                              src={
                                visitor.visitor_photo ||
                                "https://placehold.co/90x90/e0e0e0/000000?text=User"
                              } // Use actual photo or placeholder
                              className="rounded-circle"
                              style={{
                                width: "90%",
                                height: "90%",
                                objectFit: "cover",
                              }}
                              alt={visitor.visitor_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/90x90/e0e0e0/000000?text=User";
                              }}
                            />
                          </div>
                        </div>

                        {/* Name */}
                        <h5 className="mt-3 mb-1">{visitor.visitor_name}</h5>

                        {/* Badge for Number of Visits */}
                        <span
                          className="badge mt-4 text-dark border border-primary px-3 py-2"
                          style={{
                            backgroundColor: "#F5FAFE",
                          }}
                        >
                          {visitor.count} Visits
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => !isExporting && setShowExportModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Export Options</h5>
                <button
                  type="button" // Explicitly set type to button
                  className="btn-close"
                  onClick={() => !isExporting && setShowExportModal(false)}
                  disabled={isExporting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="exportPdf"
                    value="pdf"
                    checked={exportFormat === "pdf"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={isExporting}
                  />
                  <label className="form-check-label" htmlFor="exportPdf">
                    PDF
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="exportCsv"
                    value="csv"
                    checked={exportFormat === "csv"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={isExporting}
                  />
                  <label className="form-check-label" htmlFor="exportCsv">
                    CSV
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="exportExcel"
                    value="excel"
                    checked={exportFormat === "excel"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={isExporting}
                  />
                  <label className="form-check-label" htmlFor="exportExcel">
                    Excel
                  </label>
                </div>
                {isExporting && (
                  <div className="text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 mb-0 text-muted">Generating report...</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button" // Explicitly set type to button
                  className="btn btn-secondary"
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  type="button" // Explicitly set type to button
                  className="btn btn-primary"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Exporting...
                    </>
                  ) : (
                    "Export"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Options Modal */}
      {showFilterModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply Filters</h5>
                <button
                  type="button" // Explicitly set type to button
                  className="btn-close"
                  onClick={() => setShowFilterModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6 className="mb-3">Time Period:</h6>
                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.timePeriod === "daily"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("timePeriod", "daily")}
                  >
                    Daily
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.timePeriod === "weekly"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("timePeriod", "weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.timePeriod === "monthly"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("timePeriod", "monthly")}
                  >
                    Monthly
                  </button>
                </div>

                <h6 className="mb-3">Visitor Type:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.vip ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("vip")}
                  >
                    VIP
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.blacklist
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("blacklist")}
                  >
                    Blacklist
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.walkins
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("walkins")}
                  >
                    Walk-ins
                  </button>
                  <button
                    type="button" // Explicitly set type to button
                    className={`btn btn-sm ${
                      activeFilters.preregistered
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterChange("preregistered")}
                  >
                    Pre-Registered
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button" // Explicitly set type to button
                  className="btn btn-secondary"
                  onClick={() => setShowFilterModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button" // Explicitly set type to button
                  className="btn btn-primary"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrops */}
      {(showExportModal || showFilterModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default AnalyticalAndReport;
