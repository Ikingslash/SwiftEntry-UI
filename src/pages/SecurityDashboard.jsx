import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "./securityDashboard/include/NavBar";
import api from "../context/api";

function SecurityDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanResult(decodedText);
        await fetchUserProfile(decodedText);
      },
      (error) => {
        console.warn(error);
      }
    );
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // ✅ DUMMY PROFILE DATA
      const dummyProfiles = {
        "dummy-user-id-john@example.com": {
          name: "John Doe",
          visit_date: "2025-07-07",
          visit_time: "10:00 AM",
          host_name: "Mr. Smith",
          contact_info: "john@example.com | 08012345678",
          special_request: "None",
          status: "Checked In",
        },
        "dummy-user-id-jane@example.com": {
          name: "Jane Smith",
          visit_date: "2025-07-08",
          visit_time: "11:30 AM",
          host_name: "Ms. Johnson",
          contact_info: "jane@example.com | 08198765432",
          special_request: "Wheelchair",
          status: "Pending",
        },
      };

      const profile = dummyProfiles[userId] || {
        name: "Unknown Guest",
        visit_date: "N/A",
        visit_time: "N/A",
        host_name: "N/A",
        contact_info: "N/A",
        special_request: "N/A",
        status: "Not Found",
      };

      setUserProfile(profile);

      // ✅ SHOW MODAL
      const modal = new window.bootstrap.Modal(
        document.getElementById("printTagModal")
      );
      modal.show();

      // ❌ COMMENTED BACKEND CALL
      /*
      const response = await api.get(`/api/security/user-profile/${userId}`);
      setUserProfile(response.data);
      const modal = new window.bootstrap.Modal(
        document.getElementById("printTagModal")
      );
      modal.show();
      */
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // optional: reload after print
  };

  return (
    <div>
      <NavBar />

      {/* Header */}
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
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Guest Confirmation</h2>
              <i
                className="bi bi-plus-circle fs-1 text-primary p-2"
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <div className="d-flex align-items-center mt-2">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{ backgroundColor: "rgba(13, 46, 78, 0.8)" }}
                >
                  Company
                </span>
              </p>
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

      {/* QR Scanner */}
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
      </section>

      {/* MODAL */}
      <div
        className="modal fade"
        id="printTagModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg py-4"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            maxWidth: "40%",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div className="modal-content">
            <div className="modal-header d-print-none">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {userProfile && (
                <div className="row g-3 container px-5" ref={printRef}>
                  <div className="col-12 text-center mb-3">
                    <h4 style={{ fontWeight: "bold" }}>Visitor Badge</h4>
                    <hr />
                  </div>

                  <div className="col-12 text-center">
                    <img
                      src="./images/user.png"
                      alt="User"
                      className="rounded-circle mb-3"
                      width="80"
                      height="80"
                    />
                  </div>

                  <div className="col-md-6 fw-bold"><small>Guest Name</small></div>
                  <div className="col-md-6"><small>{userProfile.name}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Visit Date</small></div>
                  <div className="col-md-6"><small>{userProfile.visit_date}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Visit Time</small></div>
                  <div className="col-md-6"><small>{userProfile.visit_time}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Host Name</small></div>
                  <div className="col-md-6"><small>{userProfile.host_name}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Contact Info</small></div>
                  <div className="col-md-6"><small>{userProfile.contact_info}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Special Request</small></div>
                  <div className="col-md-6"><small>{userProfile.special_request}</small></div>
                  <hr className="w-100" />

                  <div className="col-md-6 fw-bold"><small>Status</small></div>
                  <div className="col-md-6"><small>{userProfile.status}</small></div>
                  <hr className="w-100" />

                  <div className="col-12 text-center mt-3 d-print-none">
                    <button type="button" className="btn btn-primary w-50" onClick={handlePrint}>
                      Print Tag
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print-Only Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .modal-content, .modal-content * {
            visibility: visible;
          }
          .modal-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .btn, .btn-close, .modal-header, .d-print-none {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SecurityDashboard;
