import React, { useState } from "react";
import Home from "./dashboard/Home";
import NewGuest from "./dashboard/NewGuest";
import ManageGuests from "./dashboard/ManageGuests";
import Notifications from "./dashboard/Notifications";

function Dashboard() {
  // const [activeTab, setActiveTab] = useState("home");

  return (
    <div>
      {/* <h2 className="text-center">Dashboard</h2> */}

      {/* Bootstrap Nav Tabs */}
      {/* <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>Home</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "new-guest" ? "active" : ""}`} onClick={() => setActiveTab("new-guest")}>New Guest</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "manage-guests" ? "active" : ""}`} onClick={() => setActiveTab("manage-guests")}>Manage Guests</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications</button>
        </li>
      </ul>

      {/* Content */}
      {/* <div className="mt-3">
        {activeTab === "home" && <Home />}
        {activeTab === "new-guest" && <NewGuest />}
        {activeTab === "manage-guests" && <ManageGuests />}
        {activeTab === "notifications" && <Notifications />}
      </div> */}

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
                  href="#guest"
                >
                  Guest
                </a>
              </li>
              <li className="nav-item me-3">
                <a
                  className="nav-link"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  href="#manage-guest"
                >
                  Manage Guest
                </a>
              </li>
              <li className="nav-item me-3">
                <a
                  className="nav-link"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  href="#notifications"
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
                className="bi bi-bell fs-4 text-white rounded-circle p-2"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              ></i>
            </a>

            {/* User Profile */}
            <div className="d-flex align-items-center">
              <span className="fw-medium text-white me-2">John Doe</span>
              <img
                src="./images/school/school6.jpg"
                alt="User"
                className="rounded-circle"
                width="50"
                height="50"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "352px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          marginTop: "65px ",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        {/* Left Content */}
        <div className="container">
          {/* Header Section */}
          <div
            className="text-white p-4 shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            {/* Row for Welcome Text & Plus Icon */}
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Welcome Back, John</h2>

              {/* Plus Icon */}
              <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{
                  // border: "1px solid rgba(255, 255, 255, 0.2)", // Correct border styling
                  cursor: "pointer",
                }}
              ></i>
            </div>

            {/* Badge & Line Row */}
            <div className="d-flex align-items-center mt-2">
              {/* Badge */}
              <p
                className="badge mb-0"
                style={{
                  backgroundColor: "rgba(57, 118, 175, 0.8)",
                  color: "rgba(178, 199, 219, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge "
                  style={{
                    color: "rgba(127, 169, 207, 0.8)",
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
        <div
          className="container  position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-100px" }}
        >
          <div className="row g-3 justify-content-md-center">
            {/* Total Visitors Card */}
            <div className="col-lg-4 col-md-6">
              <div
                className="card p-5 d-flex flex-row align-items-center text-dark shadow-sm rounded-3"
                style={{ backgroundColor: "rgba(255, 255, 255, 1.0)" }}
              >
                <div
                  className="p-3 rounded-3"
                  style={{ backgroundColor: "rgba(189, 211, 249, 0.96)" }}
                >
                  <i className="bi bi-people fs-3  text-primary"></i>
                </div>
                <div className="flex-grow-1 text-end">
                  <h5 className="">Total Visitors Today</h5>
                  <p className="mb-0 fs-5">12</p>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="col-lg-4 col-md-6">
              <div
                className="card p-5 d-flex flex-row align-items-center text-dark shadow-sm rounded-3"
                style={{ backgroundColor: "rgba(255, 255, 255, 1.0)" }}
              >
                <div
                  className="p-3 rounded-4"
                  style={{ backgroundColor: "rgba(189, 211, 249, 0.96)" }}
                >
                  <i
                    className="bi bi-person-check fs-3 text-primary"
                    style={{ backgroundColor: "rgba(189, 211, 249, 0.96)" }}
                  ></i>
                </div>
                <div className="flex-grow-1 text-end">
                  <h5 className="">Upcoming Visits</h5>
                  <p className="mb-0 fs-5">20</p>
                </div>
              </div>
            </div>

            {/* New Signups Card */}
            <div className="col-lg-4">
              <div
                className="card p-5 d-flex flex-row align-items-center text-dark shadow-sm rounded-3"
                style={{ backgroundColor: "rgba(255, 255, 255, 1.0)" }}
              >
                <div
                  className="p-3 rounded-4"
                  style={{ backgroundColor: "rgba(189, 211, 249, 0.96)" }}
                >
                  <i className="bi bi-eye fs-3  text-primary"></i>
                </div>
                <div className="flex-grow-1 text-end">
                  <h5 className="">Pending Guest</h5>
                  <p className="mb-0 fs-5">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Message From The Head Of School */}
      <section
        id="notifications"
        className="container p-5"
        style={{ padding: "100px 0 50px 0" }}
      >
        <div className="row m-3" style={{ padding: "100px 0 20px 0" }}>
          {/* Left Column - Recent */}
          <div className="col-md-6 pe-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Recent</h5>
              <a href="#" className="text-primary">
                See all
              </a>
            </div>

            {/* Notification Cards */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="card mb-3 p-3 shadow-sm">
                <div className="d-flex align-items-center">
                  <img
                    src="./images/logo.png"
                    alt="Logo"
                    className="me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <p className="mb-1 fw-bold">Reminder Title</p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Today's Guests */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Today's Guests</h5>
              <a href="#" className="text-primary">
                See more
              </a>
            </div>

            {/* Guest Cards (3 in a Row) */}
            <div className="d-flex justify-content-between mb-3 ">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="card text-cente p-2 m-2 shadow-sm rounded-3"
                >
                  <img src="./images/students.jpeg" alt="Guest" className="" />
                  <p className="mt-2 mb-1 fw-bold">Guest Name</p>
                  <small className="text-muted">10:30 AM</small>
                </div>
              ))}
            </div>

            {/* Notification Cards */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card mb-3 p-3 shadow-sm">
                <div className="d-flex align-items-center">
                  <img
                    src="./images/students2.jpeg"
                    alt="User"
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <p className="mb-1 fw-bold">John Doe</p>
                    <small className="text-muted">30 minutes ago</small>
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

export default Dashboard;
