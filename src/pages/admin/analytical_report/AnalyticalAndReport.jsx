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
import { useState } from "react";
import NavBar from "../include/NavBar";

function AnalyticalAndReport() {
  // Dummy Data for Charts
  const [view, setView] = useState("daily");

  // Mock data for Daily, Weekly, and Monthly views
  const tariffData = {
    daily: [
      { date: "8 AM", visitors: 5 },
      { date: "10 AM", visitors: 10 },
      { date: "12 PM", visitors: 7 },
      { date: "2 PM", visitors: 15 },
      { date: "4 PM", visitors: 12 },
      { date: "6 PM", visitors: 9 },
    ],
    weekly: [
      { date: "Mon", visitors: 50 },
      { date: "Tue", visitors: 70 },
      { date: "Wed", visitors: 40 },
      { date: "Thu", visitors: 90 },
      { date: "Fri", visitors: 100 },
      { date: "Sat", visitors: 65 },
      { date: "Sun", visitors: 80 },
    ],
    monthly: [
      { date: "Week 1", visitors: 300 },
      { date: "Week 2", visitors: 500 },
      { date: "Week 3", visitors: 450 },
      { date: "Week 4", visitors: 600 },
    ],
  };
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

  const visitorTypeData = [
    { name: "Pre-Registered", value: 60 },
    { name: "Walk-in", value: 20 },
    { name: "VIP", value: 20 },
  ];

  const visitPurposeData = [
    { name: "Recruitment", value: 30 },
    { name: "Personal/Unofficial", value: 20 },
    { name: "Business Meeting", value: 15 },
    { name: "Other", value: 20 },
    { name: "Repairs/Maintenance", value: 15 },
  ];

  const staffVisitsData = [
    { name: "Joshua Harry", visits: 100 },
    { name: "Akinbaye Bo.", visits: 65 },
    { name: "John Adamu .", visits: 50 },
    { name: "Amaka Agu .", visits: 50 },
  ];

  const peakHoursData = [
    { hour: "6-8 AM", visitors: 50 },
    { hour: "8-10 AM", visitors: 80 },
    { hour: "11-1 PM", visitors: 90 },
    { hour: "2-4 PM", visitors: 120 },
    { hour: "5-6 PM", visitors: 150 },
  ];

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

      {/* Charts Section */}
      <div className="container mt-5">
        <div className="row p-3">
          {/* Visitors Tariff (Line Chart) */}
          <div className="col-md-6 mb-4 p-3">
            <h5>Visitors Tariff (Daily, Weekly, Monthly)</h5>
            <div className="card p-2">
              {/* Dropdown for selecting chart view */}
              <div className="mb-3 text-center">
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

              {/* Line Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tariffData[view]}>
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
            </div>

            {/* Visitor Type Graph (Pie Chart) */}
            <h5 className="mt-5">Visitor Type Distribution</h5>
            <div className="card p-2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitorTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {visitorTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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
            <h5 className="mt-5">Purpose of Visit Analysis</h5>
            <div className="card p-2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitPurposeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#82ca9d"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {visitPurposeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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

          {/* Most Visited Staff (Progress Bars) */}
          <div className="col-md-6 mb-4 p-3">
            <h5>Most Visited Staff</h5>
            <div className="card p-4">
              {staffVisitsData.map((staff, index) => (
                <div key={index} className="">
                  <p className="mb-1">{staff.name}</p>
                  <div className="progress" style={{ height: "5px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${staff.visits}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                  <p className="mt-1 text-end">{staff.visits} visits</p>
                </div>
              ))}
            </div>

            {/* Peak Visitors Hour (Line Chart) */}
            <h5 className="mt-5">Peak Visitors Hour</h5>
            <div className="card p-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#FF8042"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <h5 className="mt-5">Most Frequent Visitors</h5>
            <div className="card p-2">
              <div className="row p-4">
                <div className="col-md-4">
                  <div className="card bg-light text-center p-3">
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
                          src="../image2.png"
                          className="rounded-circle"
                          style={{
                            width: "90%",
                            height: "90%",
                            objectFit: "cover",
                          }}
                          alt="Logo"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <h5 className="mt-3 mb-1">John Doe</h5>

                    {/* Badge for Number of Visits */}
                    <span
                      className="badge mt-4 text-dark border border-primary px-3 py-2"
                      style={{
                        backgroundColor: "#F5FAFE",
                      }}
                    >
                      100 Visits
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                <div className="card bg-light text-center p-3">
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
                          src="../image2.png"
                          className="rounded-circle"
                          style={{
                            width: "90%",
                            height: "90%",
                            objectFit: "cover",
                          }}
                          alt="Logo"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <h5 className="mt-3 mb-1">John Doe</h5>

                    {/* Badge for Number of Visits */}
                    <span
                      className="badge mt-4 text-dark border border-primary px-3 py-2"
                      style={{
                        backgroundColor: "#F5FAFE",
                      }}
                    >
                      100 Visits
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                <div className="card bg-light text-center p-3">
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
                          src="../image2.png"
                          className="rounded-circle"
                          style={{
                            width: "90%",
                            height: "90%",
                            objectFit: "cover",
                          }}
                          alt="Logo"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <h5 className="mt-3 mb-1">John Doe</h5>

                    {/* Badge for Number of Visits */}
                    <span
                      className="badge mt-4 text-dark border border-primary px-3 py-2"
                      style={{
                        backgroundColor: "#F5FAFE",
                      }}
                    >
                      100 Visits
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticalAndReport;
