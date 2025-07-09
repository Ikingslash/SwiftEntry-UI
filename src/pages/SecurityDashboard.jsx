import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "./securityDashboard/include/NavBar";
import api from "../context/api";
import { IDLE_NAVIGATION } from "react-router-dom";

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
        name: "Femi Biodun",
        visit_date: "08-07-2025",
        visit_time: "4:00 PM ",
        ID_No: "101256",
        host_name: "Adekunle Adeniyi",
        contact_info: "femi.biodun@gmail.com",
        purpose: "Business Meeting",
        special_request: "Wheelchair",
        status: "Pending",
      };

      setUserProfile(profile);

      const modal = new window.bootstrap.Modal(
        document.getElementById("printTagModal")
      );
      modal.show();
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
    window.location.reload();
  };

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
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Guest Confirmation</h2>
              <i className="bi bi-plus-circle fs-1 text-primary p-2" style={{ cursor: "pointer" }}></i>
            </div>
            <div className="d-flex align-items-center mt-2">
              <p className="badge text-white" style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}>
                Syndani Group {" "}
                <span className="badge text-light p-1" style={{ backgroundColor: "rgba(13, 46, 78, 0.8)" }}>
                  Company
                </span>
              </p>
              <div className="flex-grow-1 ms-2 mb-3" style={{ height: "2px", backgroundColor: "rgba(168, 172, 176, 0.8)" }}></div>
            </div>
          </div>
        </div>
      </header>

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
      <div className="modal fade" id="printTagModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down" style={{ maxWidth: "450px", marginLeft: "auto", marginRight: 0, height: "100vh" }}>
          <div className="modal-content rounded-4 shadow-lg" style={{ border: "none" }}>
            <div className="modal-header border-0 d-print-none">
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
              {userProfile && (
              <div className="modal-body px-4" ref={printRef}>
                <div className="text-center mb-4">
                  <img
                    src="./images/user.png"
                    alt="User"
                    className="rounded-circle shadow"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Guest Name</span>
                  <span>{userProfile.name}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Date</span>
                  <span>{userProfile.visit_date}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Time</span>
                  <span>{userProfile.visit_time}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">ID No.</span>
                  <span>{userProfile.ID_No}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Host Name</span>
                  <span>{userProfile.host_name}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small text-wrap">
                  <span className="text-muted">Purpose</span>
                  <span>{userProfile.purpose}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small text-wrap">
                  <span className="text-muted">Contact Info</span>
                  <span>{userProfile.contact_info}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Special Requi.</span>
                  <span>{userProfile.special_request}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Status</span>
                  <span>{userProfile.status}</span>
                </div>

                <div className="text-center mt-4 d-print-none">
                  <button
                    type="button"
                    className="btn btn-primary w-100 rounded-3 py-2"
                    onClick={handlePrint}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
