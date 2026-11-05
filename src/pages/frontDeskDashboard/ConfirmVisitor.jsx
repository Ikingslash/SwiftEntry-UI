import { useState, useRef } from "react";
import api from "../../context/api";
import { toast } from "react-toastify";
import UserAvatar from "../../components/UserAvatar";
import QRCode from "react-qr-code";
import FrontDeskTopHeader from "./include/FrontDeskTopHeader";

function ConfirmVisitor() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [userProfile, setUserProfile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
            setOtp(["", "", "", "", "", ""]);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("No visitor record found for this code.");
            setOtp(["", "", "", "", "", ""]);
        }
    };

    const handleConfirm = async () => {
        if (!userProfile || !userProfile.visit_id) {
            toast.error("No visit ID found. Please scan again.");
            return;
        }

        setIsUpdating(true);
        try {
            const response = await api.post(`/front-desk/guests/visit/security-confirm/${userProfile.visit_id}`);

            if (response.data.success) {
                toast.success("Visit confirmed successfully!");
                setIsConfirmed(true);
                setUserProfile(prev => ({ ...prev, security_confirmation: 1 }));
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

    const handlePrintBadge = async () => {
        if (!badgeRef.current) {
            toast.error("Badge content not available");
            return;
        }

        try {
            if (userProfile && userProfile.visit_id) {
                await api.post(`/front-desk/guests/visits/${userProfile.visit_id}/check-in`, {
                    actual_check_in_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    notes: "Auto check-in via Print Badge"
                });
                toast.success("Visitor automatically checked in!");
                setUserProfile(prev => ({ ...prev, status: 'Checked In', visit_status: 'checked_in' }));
            }
        } catch (error) {
            console.error("Auto check-in failed:", error);
        }

        const badgeClone = badgeRef.current.cloneNode(true);
        const qrCodeSvg = badgeClone.querySelector('svg');
        const qrCodeHtml = qrCodeSvg ? new XMLSerializer().serializeToString(qrCodeSvg) : '';

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
                    </style>
                </head>
                <body>
                    <div class="badge-card">
                        <div class="badge-header"><h3>VISITOR BADGE</h3></div>
                        <div class="badge-detail"><span class="badge-label">Name:</span><span class="badge-value">${userProfile?.name || 'N/A'}</span></div>
                        <div class="badge-detail"><span class="badge-label">Visit Date:</span><span class="badge-value">${userProfile?.visit_date || 'N/A'}</span></div>
                        <div class="badge-detail"><span class="badge-label">Host:</span><span class="badge-value">${userProfile?.host_name || 'N/A'}</span></div>
                        <div class="badge-detail"><span class="badge-label">Purpose:</span><span class="badge-value">${userProfile?.purpose || 'N/A'}</span></div>
                        <div class="badge-detail"><span class="badge-label">Badge Code:</span><span class="badge-value">${userProfile?.ID_No || 'N/A'}</span></div>
                        <div class="qr-container">${qrCodeHtml}</div>
                    </div>
                    <script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setUserProfile(null);
        setIsConfirmed(false);
    };

    return (
        <div className="min-h-screen bg-[#F0F7FF] pb-12">
            <FrontDeskTopHeader />

            {/* Header Container */}
            <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4">
                <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
                    Confirm Visit
                </p>
                <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
                    Verify a guest using their 6-digit unique code.
                </p>
            </div>

            <div className="max-w-[1140px] mx-auto px-4">
                <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 text-center space-y-6">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mb-1">
                            Code Verification
                        </h1>
                        <p className="text-slate-500 text-xs">
                            Enter guest unique code to confirm visit
                        </p>
                    </div>

                    <div className="flex justify-center gap-1.5 sm:gap-2.5 py-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-bold border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-800 bg-slate-50/50 shadow-2xs"
                                value={digit}
                                maxLength="1"
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL: Guest Profile */}
            {showModal && userProfile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 pt-4 pb-2">
                            <h5 className="font-bold text-slate-900 text-sm mb-0">
                                {isConfirmed ? "Print Visitor Badge" : "Confirm Guest Visit"}
                            </h5>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                                aria-label="Close"
                            >
                                <i className="bi bi-x-lg text-xs"></i>
                            </button>
                        </div>

                        <div className="px-5 pb-5 text-xs space-y-4">
                            <div className="text-center pt-2">
                                <UserAvatar
                                    image={userProfile.photo}
                                    firstName={userProfile.name || "Guest"}
                                    size={80}
                                    className="mx-auto mb-3"
                                />
                                <h4 className="font-bold text-slate-900 text-base">{userProfile.name}</h4>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="flex justify-between py-2.5">
                                    <span className="text-slate-400">Visit Date</span>
                                    <span className="font-semibold text-slate-800">{userProfile.visit_date}</span>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <span className="text-slate-400">Visit Time</span>
                                    <span className="font-semibold text-slate-800">{userProfile.visit_time}</span>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <span className="text-slate-400">ID No.</span>
                                    <span className="font-semibold text-slate-800">{userProfile.ID_No || "N/A"}</span>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <span className="text-slate-400">Host Name</span>
                                    <span className="font-semibold text-slate-800">{userProfile.host_name}</span>
                                </div>
                                <div className="flex justify-between py-2.5">
                                    <span className="text-slate-400">Purpose</span>
                                    <span className="font-semibold text-slate-800">{userProfile.purpose}</span>
                                </div>
                                <div className="flex justify-between py-2.5 items-center">
                                    <span className="text-slate-400">Visit Status</span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${isConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                        {isConfirmed ? "Confirmed" : userProfile.status}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 pb-1">
                                {!isConfirmed ? (
                                    <button
                                        type="button"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer border-0"
                                        onClick={handleConfirm}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? "Confirming..." : "Confirm Visit"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer border-0 flex items-center justify-center gap-2"
                                        onClick={handlePrintBadge}
                                    >
                                        <i className="bi bi-printer"></i> Print Badge
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Badge Template for Printing */}
            {userProfile && (
                <div style={{ display: 'none' }}>
                    <div ref={badgeRef}>
                        <div className="badge-card">
                            <div className="badge-header"><h3>VISITOR BADGE</h3></div>
                            <div className="badge-detail"><span className="badge-label">Name:</span><span className="badge-value">{userProfile.name}</span></div>
                            <div className="badge-detail"><span className="badge-label">Visit Date:</span><span className="badge-value">{userProfile.visit_date}</span></div>
                            <div className="badge-detail"><span className="badge-label">Host:</span><span className="badge-value">{userProfile.host_name}</span></div>
                            <div className="badge-detail"><span className="badge-label">Purpose:</span><span className="badge-value">{userProfile.purpose}</span></div>
                            <div className="badge-detail"><span className="badge-label">Badge Code:</span><span className="badge-value">{userProfile.ID_No}</span></div>
                            <div className="qr-container"><QRCode value={userProfile.ID_No || ""} size={100} /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConfirmVisitor;
