import React, { useState } from "react";
// import NewGuest from "../dashboard/NewGuest";

function Navbar() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
      style={{ backgroundColor: "#053561" }}
    >
      <div className="container">
        {/* Logo on the left */}
        <a className="navbar-brand fw-bold text-white pt-3" href="#">
          <img src="./image.png" width={150} alt="Logo" />
        </a>

        {/* Navbar Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Centered Navigation Links */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul className="navbar-nav fs-6">
            <li className="nav-item">
              <a className="nav-link text-white active" href="#home">
                Home
              </a>
            </li>
            <li className="nav-item me-3">
              <a
                className="nav-link"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
                href="/new-guest"
              >
                Guest
              </a>
            </li>
            <li className="nav-item me-3">
              <a
                className="nav-link"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
                href="/manage-guest"
              >
                Manage Guest
              </a>
            </li>
            <li className="nav-item me-3">
              <a
                className="nav-link"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
                href="/notifications"
              >
                Notification
              </a>
            </li>
          </ul>
        </div>
        {/* User info & notifications on the right */}
        <div className="d-flex align-items-center">
          {/* Notification Icon */}
          <a href="#notifications" className="me-3 position-relative">
            <i
              className="bi bi-bell fs-3 text-white rounded-circle p-2"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            ></i>
          </a>

          {/* User Profile */}
          <div className="d-flex align-items-center">
            <span className="fw-medium text-white me-4">John Doe</span>
            <img
              src="./images/user.png"
              alt="User"
              className="rounded-circle"
              width="40"
              height="40"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
