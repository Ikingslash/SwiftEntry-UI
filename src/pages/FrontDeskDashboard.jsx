import { useState } from "react";
import NavBar from "./frontDeskDashboard/include/NavBar";
import TabIncoming from "./frontDeskDashboard/include/TabIncoming";
import TabOutgoing from "./frontDeskDashboard/include/TabOutgoing";

function FrontDeskDashboard() {
  // const [activeTab, setActiveTab] = useState("home");
  const [activeTab, setActiveTab] = useState("incoming");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    group: false,
    individual: false,
    pending: false,
  });

  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const applyFilters = () => {
    // Apply the filters logic here
    console.log("Applied filters:", filters);
    setShowFilters(false);
  };
  return (
    <div>
      <NavBar />
      <header
        id="home"
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
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bod mb-0">Guest Confirmation</h2>

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

        {/* Core Values Section */}
        <div className="container position-absolute start-50 translate-middle-x w-100 px-3">
          <div className="row g-3 justify-content-md-center">
            <div className="col-lg-4 col-md-6"></div>
            <div className="col-lg-4 col-md-6"></div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation (Positioned Below Header) */}
      {/* Tabs Navigation (Positioned Below Header) */}
      <div className=" container mt-4">
        <ul
          className="nav nav-tabs container d-flex align-items-center justify-content-between"
          style={{
            overflow: "hidden",
            border: "none",
          }}
        >
          <div className="d-flex">
            <li className="nav-item">
              <button
                className="nav-link px-5 py-2"
                onClick={() => setActiveTab("incoming")}
                style={{
                  borderRadius:
                    activeTab === "incoming" ? "10px" : "10px 0px 0px 10px",
                  border:
                    activeTab === "incoming"
                      ? "2px solid rgb(151, 196, 245)"
                      : "none",
                  background:
                    activeTab === "incoming" ? "white" : "rgb(244, 246, 249)",
                  color:
                    activeTab === "incoming" ? "#007bff" : "rgba(0, 0, 0, 0.5)",
                  fontWeight: activeTab === "incoming" ? "bold" : "normal",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Incoming
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link px-5 py-2"
                onClick={() => setActiveTab("outgoing")}
                style={{
                  borderRadius:
                    activeTab === "outgoing" ? "10px" : "0px 10px 10px 0px",
                  border:
                    activeTab === "outgoing"
                      ? "2px solid rgb(163, 195, 229)"
                      : "none",
                  background:
                    activeTab === "outgoing" ? "white" : "rgb(244, 246, 249)",
                  color:
                    activeTab === "outgoing" ? "#007bff" : "rgba(0, 0, 0, 0.5)",
                  fontWeight: activeTab === "outgoing" ? "bold" : "normal",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Outgoing
              </button>
            </li>
          </div>

          {/* Search Bar with Settings Icon */}
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
              />
              <i
                className="bi bi-sliders position-absolute"
                style={{
                  top: "50%",
                  right: "15px",
                  transform: "translateY(-50%)",
                  color: "#053561",
                  cursor: "pointer",
                }}
                onClick={() => setShowFilters(!showFilters)}
              ></i>
            </div>

            {/* Filter Dropdown */}
            {showFilters && (
              <div
                className="position-absolute bg-white rounded shadow-sm p-3"
                style={{
                  top: "45px",
                  right: "0",
                  width: "220px",
                  zIndex: 1000,
                  border: "1px solid #ced4da",
                }}
              >
                <h6 className="mb-3 fw-bold text-secondary">Filter by:</h6>

                <div className="form-check mb-2">
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

                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="individualFilter"
                    checked={filters.individual}
                    onChange={() => handleFilterChange("individual")}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="individualFilter"
                  >
                    Individual
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pendingFilter"
                    checked={filters.pending}
                    onChange={() => handleFilterChange("pending")}
                  />
                  <label className="form-check-label" htmlFor="pendingFilter">
                    Pending
                  </label>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={applyFilters}
                  style={{
                    backgroundColor: "#053561",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>
      {/* Tab Content */}
      <div className="container mt-5">
        {activeTab === "incoming" && <TabIncoming />}
        {activeTab === "outgoing" && <TabOutgoing />}
      </div>
    </div>
  );
}

export default FrontDeskDashboard;
