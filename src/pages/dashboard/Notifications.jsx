import React from "react";
import NavBar from "./include/NavBar";

function Notifications() {
  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center d-flex align-items-center px-4"
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
              <h3 className="fw-bold mb-0">Notifications</h3>

              {/* Plus Icon */}
              <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{
                  // border: "1px solid rgba(255, 255, 255, 0.2)", // Correct border styling
                  cursor: "pointer",
                }}
              ></i>
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
      </header>

      <section id="notifications" className="container p-5 mx-4">
        <div className="row m-3" style={{ padding: "10px 0 20px 0" }}>
          {/* Left Column - Recent */}
          <div className="pe-5">
            {/* Notification Cards */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="card mb-4 p-3 shadow-sm">
                <div className="d-flex align-items-center justify-content-between">
                  {/* Left Section: User Image & Info */}
                  <div className="d-flex align-items-center">
                    <img
                      src="./images/clock.png"
                      alt="Logo"
                      className="me-3"
                      width="40"
                      height="40"
                    />
                    <div className="ms-3">
                      <p
                        className="mb-3 fw-medium"
                        style={{
                          padding: "0 400px 0 0",
                        }}
                      >
                        <small>
                          Use border utilities to quickly style the border and
                          border-radius of an element. Use border utilities to
                          quickly style the border and border-radius of an
                          element.
                        </small>
                      </p>
                      <small className="text-muted">Yesterday</small> |
                      <small className="text-muted">30 minutes ago</small>
                    </div>

                    <div></div>
                  </div>

                  {/* Right Section: Arrow Icon */}

                  <span
                    className={`ms-2 ${
                      index % 2 === 0 ? "text-success me-3" : "text-danger me-3"
                    }`}
                  >
                    ●
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Notifications;
