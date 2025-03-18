import { useState } from "react";
import NavBar from "./include/NavBar";
import TabPreRegisteredVisitors from "./include/TabPreRegisteredVisitors";
import TabWalkInVisitors from "./include/TabWalkInVisitors";
import { IoCheckmark } from "react-icons/io5";

function VisitSecurityHistory() {
  const [activeTab, setActiveTab] = useState("pre-registered-visitors");
  const [activeFilter, setActiveFilter] = useState("all");

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
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">History</h3>

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
      </header>

      {/* Tabs Navigation (Positioned Below Header) */}
      <div className="container mt-5">
        <div className="d-flex align-items-center justify-content-between">
          {/* Tabs Section */}
          <div className="d-flex flex-column w-100 position-relative">
            {/* Full-width thin bottom line */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "1px",
                backgroundColor: "rgb(200, 200, 200)", // Light grey bottom border
              }}
            ></div>

            <ul className="nav d-flex flex-wrap">
              <li className="nav-item">
                <a
                  className="nav-link px-4 py-2 text-center"
                  onClick={() => setActiveTab("pre-registered-visitors")}
                  style={{
                    borderBottom:
                      activeTab === "pre-registered-visitors"
                        ? "4px solid rgb(0, 123, 255)"
                        : "4px solid transparent",
                    color:
                      activeTab === "pre-registered-visitors"
                        ? "#007bff"
                        : "rgba(0, 0, 0, 0.5)",
                    fontWeight:
                      activeTab === "pre-registered-visitors"
                        ? "bold"
                        : "normal",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                    minWidth: "180px",
                  }}
                >
                  Pre-Registered Visitors
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-4 py-2 text-center"
                  onClick={() => setActiveTab("walk-in-visitors")}
                  style={{
                    borderBottom:
                      activeTab === "walk-in-visitors"
                        ? "4px solid rgb(0, 123, 255)"
                        : "4px solid transparent",
                    color:
                      activeTab === "walk-in-visitors"
                        ? "#007bff"
                        : "rgba(0, 0, 0, 0.5)",
                    fontWeight:
                      activeTab === "walk-in-visitors" ? "bold" : "normal",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                    minWidth: "150px",
                  }}
                >
                  Walk-in Visitors
                </a>
              </li>
            </ul>
          </div>

          {/* Filters Section */}
          <div className="d-flex gap-2">
            {/* Month Filter */}
            <select
              className="form-select me-3"
              style={{ minWidth: "150px", flex: "1" }}
            >
              <option value="">Select Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month.toLowerCase()}>
                  {month}
                </option>
              ))}
            </select> 
           
            {/* Visitor Type Filter */}
            {[
              { label: "All", value: "all", width: "60px" },
              {
                label: "Pre-Registered Visitors",
                value: "pre-registered",
                width: "180px",
              },
              { label: "Walk-in Visitors", value: "walk-in", width: "160px" },
            ].map((item) => (
              <a
                key={item.value}
                onClick={() => setActiveFilter(item.value)}
                className={`bg-white d-flex align-items-center justify-content-center text-dark text-decoration-none border ${
                  activeFilter === item.value
                    ? "border-primary"
                  : "border"
                }`}
                style={{
                  minWidth: item.width,
                  borderRadius: "7px",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                }}
              >
                <small>{item.label}</small>
                {activeFilter === item.value && (
                 <IoCheckmark className="fs-5 text-primary" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mt-5">
        {activeTab === "pre-registered-visitors" && (
          <TabPreRegisteredVisitors />
        )}
        {activeTab === "walk-in-visitors" && <TabWalkInVisitors />}
      </div>
    </div>
  );
}

export default VisitSecurityHistory;
