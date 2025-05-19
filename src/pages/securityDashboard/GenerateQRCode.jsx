import React, { useState } from "react";
import QRCode from "react-qr-code";
import NavBar from "../securityDashboard/include/NavBar";

function GenerateQRCode() {
  const [email, setEmail] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleGenerateQR = async () => {
    try {
      const response = await fetch("/api/security/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.qr_code_data) {
        setQrValue(data.qr_code_data);
      } else {
        alert("QR code could not be generated");
      }
    } catch (error) {
      console.error("QR generation error", error);
    }
  };

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
      <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold mb-4">Generate QR Code</h2>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded mb-4"
      />
      <button
        className="bg-green-500 text-white px-6 py-2 rounded"
        onClick={handleGenerateQR}
      >
        Generate QR Code
      </button>

      {qrValue && (
        <div className="mt-6">
          <QRCode value={qrValue} />
          <p className="mt-2 text-sm text-gray-600">Encoded ID: {qrValue}</p>
        </div>
      )}
    </div>
      </section>
    </div>
  );
}

export default GenerateQRCode;
