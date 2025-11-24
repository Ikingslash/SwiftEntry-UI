import { useState } from "react";
import NavBar from "./include/NavBar";

import FrontdeskTabGroup from "./include/FrontdeskTabGroup";
import FrontdeskTabIndividual from "./include/FrontdeskTabIndividual";

function ManageFrontdeskGuestsIndividual() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "352px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        {/* Left Content */}
        <div className="container">
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Manage Guest</h3>

              {/* Plus Icon */}
            </div>

            <div
              className="flex-grow-1 px-4"
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            ></div>
          </div>
        </div>

        {/* Core Values Section */}
        <div
          className="container position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-90px" }}
        >
          <div className="row g-3 justify-content-md-center">
            <div className="col-lg-4 col-md-6"></div>
            <div className="col-lg-4 col-md-6"></div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation (Positioned Below Header) */}
      <div className="position-relative">
        <ul
          className="nav nav-tabs container"
          style={{
            position: "absolute",
            top: "-47px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <li className="nav-item me-3">
            <button
              className={`nav-link  fs-5 ${
                activeTab === "individual" ? "active" : "text-light"
              }`}
              onClick={() => setActiveTab("individual")}
            >
              Individual
            </button>
          </li>
          <li className="nav-item ms-3">
            <button
              className={`nav-link  fs-5  ${
                activeTab === "group" ? "active" : "text-light"
              }`}
              onClick={() => setActiveTab("group")}
            >
              Group
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="container mt-5">
        {activeTab === "individual" && <FrontdeskTabIndividual />}
        {activeTab === "group" && <FrontdeskTabGroup />}
      </div>
    </div>
  );
}

export default ManageFrontdeskGuestsIndividual;
