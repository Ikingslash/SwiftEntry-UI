import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "./securityDashboard/include/NavBar";

function SecurityDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
      // supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] // Ensure it's using the camera
    });

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log("Available devices:", devices);
    });

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        fetchUserProfile(decodedText); // Fetch user details
      },
      (err) => console.error(err)
    );

    return () => scanner.clear();
  }, []);

  // Dummy user profile data for testing
  const dummyProfiles = {
    12345: { name: "John Doe", email: "johndoe@example.com", role: "Visitor" },
    67890: {
      name: "Jane Smith",
      email: "janesmith@example.com",
      role: "Employee",
    },
  };

  const fetchUserProfile = async (userId) => {
    try {
      // Simulating API request with dummy data
      const data = dummyProfiles[userId] || {
        name: "Unknown",
        email: "N/A",
        role: "N/A",
      };
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
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

      {/* QR Code Scanner Section */}
      <section className="container d-flex flex-column align-items-center justify-content-center text-center p-5">
        <h2 className="mb-4">Scan QR Code</h2>
        <div
          id="reader"
          style={{
            width: "300px",
            height: "300px",
            border: "4px solid black",
            borderRadius: "10px",
            backgroundColor: "grey",
          }}
        ></div>
        <a href="#" className="mt-4">
          <small>Enter Code Instead</small>
        </a>
        {/* User Profile Modal */}
        {userProfile && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
              borderRadius: "10px",
              textAlign: "center",
              zIndex: 999,
            }}
          >
            <h3>User Profile</h3>
            <p>
              <b>Name:</b> {userProfile.name}
            </p>
            <p>
              <b>Email:</b> {userProfile.email}
            </p>
            <p>
              <b>Role:</b> {userProfile.role}
            </p>
            <button
              className="btn btn-danger mt-2"
              onClick={() => setUserProfile(null)}
            >
              Close
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default SecurityDashboard;
