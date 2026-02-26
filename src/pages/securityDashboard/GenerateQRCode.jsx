import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import NavBar from "../securityDashboard/include/NavBar";

function GenerateQRCode() {
  const [email, setEmail] = useState("");
  const [qrValue, setQrValue] = useState("");

  // Simulate getting user email on page load
  useEffect(() => {
    // Example: get from localStorage (or simulate)
    const dummyEmail = "john@example.com"; // Replace with localStorage.getItem("email") if available
    setEmail(dummyEmail);
    setQrValue(`dummy-user-id-${dummyEmail}`);
  }, []);

  return (
    <div>
      <NavBar />

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
          <div className="text-white shadow-sm" style={{ backgroundColor: "#053561", minHeight: "180px" }}>
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bod mb-0">Guest Confirmation</h2>
              <i className="bi bi-plus-circle fs-1 text-primary p-2" style={{ cursor: "pointer" }}></i>
            </div>
            <div className="d-flex align-items-center mt-2">
              <p className="badge text-white" style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}>
                Sydani Group{" "}
                <span className="badge text-light p-1" style={{ backgroundColor: "rgba(13, 46, 78, 0.8)" }}>
                  Company
                </span>
              </p>
              <div className="flex-grow-1 ms-2 mb-3" style={{ height: "2px", backgroundColor: "rgba(168, 172, 176, 0.8)" }}></div>
            </div>
          </div>
        </div>
      </header>

      <section className="container p-5 text-center">
        <h2 className="text-2xl font-bold mb-4">QR Code for Guest</h2>

        {qrValue ? (
          <div className="mt-6">
            <QRCode value={qrValue} />
            {/* <p className="mt-2 text-sm text-gray-600">Encoded ID: {qrValue}</p> */}
            <p className="text-muted mt-3">Email: {email}</p>
          </div>
        ) : (
          <p>Generating QR code...</p>
        )}
      </section>
    </div>
  );
}

export default GenerateQRCode;
