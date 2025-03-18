import { useState } from "react";
import NavBar from "../include/NavBar";
import AdminVisitorsTab from "./AdminVisitorsTab";
import AdminVisit from "./AdminVisit";

function AdminVisitors() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [showModal, setShowModal] = useState(false);

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
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center ">
              <h3 className="mb-4">Manage Visitors</h3>
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

      {/* Tabs Navigation */}
      <div className="position-relative">
        <div
          className="d-flex justify-content-between align-items-center container"
          style={{
            position: "absolute",
            top: "-47px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        >
          {/* Navigation Tabs */}
          <ul
            className="nav nav-tabs"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <li className="nav-item me-3">
              <button
                className={`nav-link fs-5 ${
                  activeTab === "visitors" ? "active" : "text-light"
                }`}
                onClick={() => setActiveTab("visitors")}
              >
                Visitors
              </button>
            </li>
            <li className="nav-item ms-3">
              <button
                className={`nav-link fs-5 ${
                  activeTab === "visit" ? "active" : "text-light"
                }`}
                onClick={() => setActiveTab("visit")}
              >
                Visit
              </button>
            </li>
          </ul>

          {/* Add New Visitor Button */}
          <button
            className="btn btn-primary rounded-3 ms-auto"
            onClick={() => setShowModal(true)}
          >
            + Add New Visitor
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mt-5">
        {activeTab === "visitors" && <AdminVisitorsTab />}
        {activeTab === "visit" && <AdminVisit />}
      </div>

      {/* Modal for Adding a Visitor */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-3"
              style={{
                backgroundColor: "#F5FAFE",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Create Visitors Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Visitors Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Type</label>
                    <select className="form-select">
                      <option>Select Guest Type</option>
                      <option>Individual </option>
                      <option>Group</option>
                    </select>
                  </div>
                  <div className="my-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" />
                  </div>
                  <div className="my-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mt-5 text-center">
                    <button
                      type="submit"
                      className="btn btn-primary w-50"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModal(false);
                      }}
                    >
                      Create Visitor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVisitors;
