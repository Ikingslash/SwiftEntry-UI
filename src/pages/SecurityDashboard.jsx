import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "./securityDashboard/include/NavBar";
import api from "../context/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

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
        let code = decodedText;

        try {
          // Attempt to parse if it's JSON
          const data = JSON.parse(decodedText);
          if (data && (data.id || data.visit_id || data.code)) {
            code = data.code || data.id || data.visit_id; // Prioritize fields
          }
        } catch (e) {
          // Not JSON, might be a URL or raw string.
          // Check if it's a URL and extract last segment if needed, 
          // but for now assume raw code if not JSON.
          if (decodedText.startsWith("http")) {
            const urlParts = decodedText.split('/');
            code = urlParts[urlParts.length - 1];
          }
        }

        setScanResult(code);
        await fetchUserProfile(code);
      },
      (error) => {
        console.warn(error);
      }
    );
  }, []);

  const fetchUserProfile = async (code) => {
    try {
      const response = await api.get(`/security/visit/scan/${code}`);
      setUserProfile(response.data);

      const modal = new window.bootstrap.Modal(
        document.getElementById("printTagModal")
      );
      modal.show();
    } catch (error) {
      console.error("Scan Error:", error);
      toast.error("No visitor record found for this code.");
    }
  };

  // ✅ NEW FUNCTION: Update security confirmation in database
  const handleConfirmVisit = async () => {
    if (!userProfile || !userProfile.visit_id) {
      toast.error("No visit data available.");
      return;
    }

    try {
      const response = await api.post(`/security/visit/confirm/${userProfile.visit_id}`);

      if (response.status === 200) {
        toast.success("Visit confirmed successfully!");

        // Update local state to show confirmation
        setUserProfile(prev => ({
          ...prev,
          security_confirmation: 1,
          status: "Confirmed"
        }));

        // Close the modal after confirmation
        const modal = bootstrap.Modal.getInstance(document.getElementById("printTagModal"));
        if (modal) {
          modal.hide();
        }

        // Reset scan result for next scan
        setScanResult(null);
      } else {
        toast.error(response.data.message || "Failed to confirm visit.");
      }
    } catch (error) {
      console.error("Confirm Error:", error);

      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.values(validationErrors).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(error.response?.data?.message || "An error occurred while confirming the visit.");
      }
    }
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
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
              {/* REMOVED: Plus button */}
            </div>
            <div className="d-flex align-items-center mt-2">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Sydani Group{" "}
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

        <NavLink
          className="mt-4"
          to="/security-dashboard/generate-by-unique-code"
        >
          <small>Enter Code Instead</small>
        </NavLink>
      </section>

      {/* MODAL */}
      <div
        className="modal fade"
        id="printTagModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down"
          style={{
            maxWidth: "450px",
            marginLeft: "auto",
            marginRight: 0,
            height: "100vh",
          }}
        >
          <div
            className="modal-content rounded-4 shadow-lg"
            style={{ border: "none" }}
          >
            <div className="modal-header border-0 d-print-none">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {userProfile && (
              <div className="modal-body px-4" ref={printRef}>
                <div className="text-center mb-4">
                  <UserAvatar
                    image={userProfile.photo}
                    firstName={userProfile.name || "Visitor"}
                    size={80}
                    className="mx-auto shadow rounded-circle"
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
                  <span>
                    {userProfile.security_confirmation === 1 ? (
                      <span className="badge bg-success">Confirmed</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Pending</span>
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Security Confirmation</span>
                  <span>
                    {userProfile.security_confirmation === 1 ? (
                      <span className="badge bg-success">✓ Confirmed</span>
                    ) : (
                      <span className="badge bg-secondary">Pending</span>
                    )}
                  </span>
                </div>

                <div className="text-center mt-4 d-print-none">
                  {userProfile.security_confirmation === 1 ? (
                    <button
                      type="button"
                      className="btn btn-success w-100 rounded-3 py-2"
                      disabled
                    >
                      ✓ Already Confirmed
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary w-100 rounded-3 py-2"
                      onClick={handleConfirmVisit}
                    >
                      Confirm Visit
                    </button>
                  )}
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
