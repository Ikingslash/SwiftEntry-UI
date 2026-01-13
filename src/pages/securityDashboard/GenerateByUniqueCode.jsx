import { useState, useRef } from "react";
import NavBar from "../securityDashboard/include/NavBar";
import api from "../../context/api";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UserAvatar from "../../components/UserAvatar";

function GenerateByUniqueCode() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userProfile, setUserProfile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const modalRef = useRef(null);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleSubmit = async (enteredOtp) => {
    try {
      const response = await api.get(`/security/visit/scan/${enteredOtp}`);
      setUserProfile(response.data);

      // Reset OTP after successful scan
      setOtp(["", "", "", "", "", ""]);

      // Show modal using ref
      if (modalRef.current) {
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("No visitor record found for this code.");
      setOtp(["", "", "", "", "", ""]); // Reset on error
    }
  };

  const handleConfirm = async () => {
    if (!userProfile || !userProfile.visit_id) {
      toast.error("No visit ID found. Please scan again.");
      return;
    }

    setIsUpdating(true);
    try {
      // Call API to update security confirmation
      const response = await api.post(`/security/visit/confirm/${userProfile.visit_id}`);

      if (response.data.success) {
        toast.success("Visit confirmed successfully!");

        // Close the modal
        if (modalRef.current) {
          const modal = window.bootstrap.Modal.getInstance(modalRef.current);
          modal.hide();
        }

        // Reset state
        setUserProfile(null);

        // Optionally refresh the page or show success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to confirm visit");
      }
    } catch (error) {
      console.error("Error confirming visit:", error);
      toast.error(error.response?.data?.message || "An error occurred while confirming the visit");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      {/* Hero */}
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
          <div className="text-white shadow-sm" style={{ minHeight: "180px" }}>
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="fw-bold mb-0">Guest Confirmation</h2>
            </div>
            <div className="d-flex align-items-center mt-2">
              <p
                className="badge text-white"
                style={{ backgroundColor: "rgba(25, 88, 148, 0.8)" }}
              >
                Security Confirmation
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

      {/* OTP Entry Section */}
      <section className="container p-5 text-center">
        <div className="row text-center justify-content-center">
          <div className="col-md-6 col-lg-5 col-12">
            <div className="text-center pt-3">
              <p className="text-muted">Enter Guest Unique Code</p>
            </div>
            <div className="my-5">
              <div className="d-flex justify-content-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    className="form-control text-center fs-4"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "5px",
                    }}
                    value={digit}
                    maxLength="1"
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <NavLink className="mt-4 d-block" to="/security-dashboard">
              <small>Scan QR Instead</small>
            </NavLink>
          </div>
        </div>
      </section>

      {/* MODAL: Guest Profile */}
      <div
        className="modal fade"
        id="printTagModal"
        ref={modalRef}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down"
          style={{ maxWidth: "450px", marginLeft: "auto", marginRight: 0 }}
        >
          <div
            className="modal-content rounded-4 shadow-lg"
            style={{ border: "none" }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title">Confirm Guest Visit</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            {userProfile && (
              <div className="modal-body px-4">
                <div className="text-center mb-4">
                  <UserAvatar
                    image={userProfile.photo}
                    firstName={userProfile.name || "Guest"}
                    size={80}
                    className="rounded-circle shadow mb-3 mx-auto"
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
                  <span>{userProfile.ID_No || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Host Name</span>
                  <span>{userProfile.host_name}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Purpose</span>
                  <span>{userProfile.purpose}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Contact Info</span>
                  <span>{userProfile.contact_info || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Special Requirements</span>
                  <span>{userProfile.special_request || "None"}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-4 small">
                  <span className="text-muted">Visit Status</span>
                  <span
                    className={`badge bg-${userProfile.status === "confirmed" ? "success" : "warning"
                      }`}
                  >
                    {userProfile.status}
                  </span>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-100 rounded-3 py-2"
                    onClick={handleConfirm}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Confirming...
                      </>
                    ) : (
                      "Confirm Visit"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateByUniqueCode;
