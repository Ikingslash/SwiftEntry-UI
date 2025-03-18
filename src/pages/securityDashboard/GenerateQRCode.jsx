import React, { useState } from "react";
import QRCode from "react-qr-code";
import NavBar from "../frontDeskDashboard/include/NavBar";

function GenerateQRCode() {
  const [email, setEmail] = useState("");

  return (
    <div>
      <NavBar />

      {/* Hero Section */}
      <header
        className="text-white text-center position-relative px-4"
        style={{
          backgroundColor: "#053561",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
          paddingTop: "20px",
          paddingBottom: "50px",
        }}
      >
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

      {/* QR Code Scanner and Generator Section */}
      <section className="container p-5 text-center">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Generate QR Code</h2>
          <input
            type="text"
            placeholder="Enter correct email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", marginBottom: "20px", width: "300px" }}
          />
          <div
            style={{
              border: "2px solid black",
              padding: "10px",
              display: "inline-block",
            }}
          >
            {email && <QRCode value={email} size={300} />}
          </div>
        </div>
      </section>
    </div>
  );
}

export default GenerateQRCode;
