import { useState, useRef } from "react";
import NavBar from "./include/NavBar";
import api from "../../context/api";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UserAvatar from "../../components/UserAvatar";
import QRCode from "react-qr-code";

function ConfirmVisitor() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [userProfile, setUserProfile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const modalRef = useRef(null);
    const badgeRef = useRef(null);

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
            const response = await api.get(`/front-desk/guests/visit/scan/${enteredOtp}`);
            setUserProfile(response.data);
            setIsConfirmed(response.data.security_confirmation === 1);

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
            const response = await api.post(`/front-desk/guests/visit/security-confirm/${userProfile.visit_id}`);

            if (response.data.success) {
                toast.success("Visit confirmed successfully!");
                setIsConfirmed(true);

                // Update the userProfile to reflect confirmation
                setUserProfile(prev => ({
                    ...prev,
                    security_confirmation: 1
                }));
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

    const handlePrintBadge = () => {
        if (!badgeRef.current) {
            toast.error("Badge content not available");
            return;
        }

        // Clone the badge content to properly serialize it
        const badgeClone = badgeRef.current.cloneNode(true);

        // Get the QR code SVG and convert to proper string
        const qrCodeSvg = badgeClone.querySelector('svg');
        let qrCodeHtml = '';
        if (qrCodeSvg) {
            qrCodeHtml = new XMLSerializer().serializeToString(qrCodeSvg);
        }

        const printContent = `
            <div class="badge-card">
                <div class="badge-header">
                    <h3>VISITOR BADGE</h3>
                </div>
                <div class="badge-detail">
                    <span class="badge-label">Name:</span>
                    <span class="badge-value">${userProfile?.name || 'N/A'}</span>
                </div>
                <div class="badge-detail">
                    <span class="badge-label">Visit Date:</span>
                    <span class="badge-value">${userProfile?.visit_date || 'N/A'}</span>
                </div>
                <div class="badge-detail">
                    <span class="badge-label">Host:</span>
                    <span class="badge-value">${userProfile?.host_name || 'N/A'}</span>
                </div>
                <div class="badge-detail">
                    <span class="badge-label">Purpose:</span>
                    <span class="badge-value">${userProfile?.purpose || 'N/A'}</span>
                </div>
                <div class="badge-detail">
                    <span class="badge-label">Badge Code:</span>
                    <span class="badge-value">${userProfile?.ID_No || 'N/A'}</span>
                </div>
                <div class="qr-container">
                    ${qrCodeHtml}
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) {
            toast.error("Please allow popups to print the badge");
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Visitor Badge</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
                        .badge-card { border: 2px solid #053561; border-radius: 10px; padding: 20px; max-width: 350px; margin: 0 auto; }
                        .badge-header { background-color: #053561; color: white; padding: 15px; text-align: center; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }
                        .badge-header h3 { margin: 0; }
                        .badge-detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .badge-label { color: #666; font-size: 12px; }
                        .badge-value { font-weight: bold; font-size: 14px; }
                        .qr-container { text-align: center; margin-top: 20px; }
                        .qr-container svg { max-width: 120px; height: auto; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 250);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const closeModal = () => {
        if (modalRef.current) {
            const modal = window.bootstrap.Modal.getInstance(modalRef.current);
            if (modal) modal.hide();
        }
        setUserProfile(null);
        setIsConfirmed(false);
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
                                Front Desk Confirmation
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

                        <NavLink className="mt-4 d-block" to="/frontdesk-dashboard">
                            <small>Back to Dashboard</small>
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
                            <h5 className="modal-title">
                                {isConfirmed ? "Print Visitor Badge" : "Confirm Guest Visit"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeModal}
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
                                    <span className="text-muted">Visit Status</span>
                                    <span
                                        className={`badge bg-${isConfirmed ? "success" : "warning"}`}
                                    >
                                        {isConfirmed ? "Confirmed" : userProfile.status}
                                    </span>
                                </div>

                                <div className="text-center mt-4">
                                    {!isConfirmed ? (
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
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-success w-100 rounded-3 py-2"
                                            onClick={handlePrintBadge}
                                        >
                                            <i className="bi bi-printer me-2"></i>
                                            Print Badge
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Badge Template for Printing */}
            {userProfile && (
                <div style={{ display: 'none' }}>
                    <div ref={badgeRef}>
                        <div className="badge-card">
                            <div className="badge-header">
                                <h3>VISITOR BADGE</h3>
                            </div>
                            <div className="badge-detail">
                                <span className="badge-label">Name:</span>
                                <span className="badge-value">{userProfile.name}</span>
                            </div>
                            <div className="badge-detail">
                                <span className="badge-label">Visit Date:</span>
                                <span className="badge-value">{userProfile.visit_date}</span>
                            </div>
                            <div className="badge-detail">
                                <span className="badge-label">Host:</span>
                                <span className="badge-value">{userProfile.host_name}</span>
                            </div>
                            <div className="badge-detail">
                                <span className="badge-label">Purpose:</span>
                                <span className="badge-value">{userProfile.purpose}</span>
                            </div>
                            <div className="badge-detail">
                                <span className="badge-label">Badge Code:</span>
                                <span className="badge-value">{userProfile.ID_No}</span>
                            </div>
                            <div className="qr-container">
                                <QRCode value={userProfile.ID_No || ""} size={100} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConfirmVisitor;
