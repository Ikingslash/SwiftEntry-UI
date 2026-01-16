import { useState, useEffect } from "react";
import NavBar from "./frontDeskDashboard/include/NavBar";
import TabPendingVisits from "./frontDeskDashboard/include/TabPendingVisits";
import TabConfirmedVisits from "./frontDeskDashboard/include/TabConfirmedVisits";
import TabIncoming from "./frontDeskDashboard/include/TabIncoming";
import TabOutgoing from "./frontDeskDashboard/include/TabOutgoing";
import api from "../context/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FrontDeskDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    group: false,
    individual: false,
  });

  // Refresh function for all tabs
  const refreshVisits = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  // Tab styles function
  const getTabStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      borderRadius: "10px",
      border: isActive ? "2px solid rgb(151, 196, 245)" : "none",
      background: isActive ? "white" : "rgb(244, 246, 249)",
      color: isActive ? "#007bff" : "rgba(0, 0, 0, 0.5)",
      fontWeight: isActive ? "bold" : "normal",
      transition: "all 0.3s ease-in-out",
      margin: "0 2px",
    };
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      <header
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "280px",
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
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Guest Management</h2>
            </div>
            <div className="d-flex align-items-center mt-2">
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
              <div
                className="flex-grow-1 ms-2 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="container mt-4">
        <ul
          className="nav nav-tabs container d-flex align-items-center justify-content-between"
          style={{ border: "none" }}
        >
          <div className="d-flex flex-wrap">
            <li className="nav-item">
              <button
                className="nav-link px-4 py-2"
                onClick={() => setActiveTab("pending")}
                style={getTabStyle("pending")}
              >
                Registered
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link px-4 py-2"
                onClick={() => setActiveTab("confirmed")}
                style={getTabStyle("confirmed")}
              >
                Confirmed
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link px-4 py-2"
                onClick={() => setActiveTab("incoming")}
                style={getTabStyle("incoming")}
              >
                Checked In
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link px-4 py-2"
                onClick={() => setActiveTab("outgoing")}
                style={getTabStyle("outgoing")}
              >
                Checked Out
              </button>
            </li>
          </div>

          {/* Search + Filters */}
          <div className="d-flex align-items-center position-relative">
            <div className="position-relative me-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search guests..."
                style={{
                  borderRadius: "20px",
                  paddingRight: "40px",
                  width: "400px",
                  border: "1px solid #ced4da",
                }}
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <i
                className="bi bi-search position-absolute"
                style={{
                  top: "50%",
                  right: "15px",
                  transform: "translateY(-50%)",
                  color: "#053561",
                }}
              ></i>
            </div>

            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle ms-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-funnel"></i> Filter
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-3">
                <h6 className="dropdown-header">Filter by Type</h6>
                <li>
                  <div className="form-check ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="individualFilter"
                      checked={filters.individual}
                      onChange={() => handleFilterChange("individual")}
                    />
                    <label className="form-check-label" htmlFor="individualFilter">
                      Individual
                    </label>
                  </div>
                </li>
                <li>
                  <div className="form-check ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="groupFilter"
                      checked={filters.group}
                      onChange={() => handleFilterChange("group")}
                    />
                    <label className="form-check-label" htmlFor="groupFilter">
                      Group
                    </label>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setFilters({ group: false, individual: false })}
                  >
                    Clear Filters
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="container mt-4">
        {activeTab === "pending" && (
          <TabPendingVisits
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
            onVisitAction={refreshVisits}
          />
        )}
        {activeTab === "confirmed" && (
          <TabConfirmedVisits
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
            onVisitAction={refreshVisits}
          />
        )}
        {activeTab === "incoming" && (
          <TabIncoming
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
            onVisitAction={refreshVisits}
          />
        )}
        {activeTab === "outgoing" && (
          <TabOutgoing
            filters={filters}
            searchQuery={searchQuery}
            refreshKey={refreshKey}
            onVisitAction={refreshVisits}
          />
        )}
      </div>
    </div>
  );
}

export default FrontDeskDashboard;
