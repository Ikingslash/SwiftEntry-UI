import { useState } from "react";
import api from "../../context/api";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import UserAvatar from "../../components/UserAvatar";
import {
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  QrCode,
} from "lucide-react";

function GenerateByUniqueCode() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userProfile, setUserProfile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleSubmit = async (enteredOtp) => {
    try {
      const response = await api.get(`/security/visit/scan/${enteredOtp}`);
      setUserProfile(response.data);
      setShowModal(true);
      setOtp(["", "", "", "", "", ""]);
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
      const response = await api.post(
        `/security/visit/confirm/${userProfile.visit_id}`
      );

      if (response.data.success) {
        toast.success("Visit confirmed successfully!");
        setShowModal(false);
        setUserProfile(null);
      } else {
        toast.error(response.data.message || "Failed to confirm visit");
      }
    } catch (error) {
      console.error("Error confirming visit:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while confirming the visit"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const details = userProfile
    ? [
        { label: "Guest Name", value: userProfile.name },
        { label: "Visit Date", value: userProfile.visit_date },
        { label: "Visit Time", value: userProfile.visit_time },
        { label: "ID No.", value: userProfile.ID_No },
        { label: "Host Name", value: userProfile.host_name },
        { label: "Purpose", value: userProfile.purpose },
        { label: "Contact Info", value: userProfile.contact_info },
        { label: "Special Request", value: userProfile.special_request },
      ]
    : [];

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Enter Unique Code
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Type the 6-digit visitor code to verify and confirm their visit.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-5 sm:p-8 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 mb-0">
                Guest Unique Code
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mb-0">
                The code is confirmed automatically once all digits are filled.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                className="w-full max-w-[52px] h-12 sm:h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                value={digit}
                maxLength="1"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus={index === 0}
                aria-label={`Code digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6">
            <NavLink
              to="/security-dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all no-underline w-full sm:w-auto"
            >
              <QrCode className="w-3.5 h-3.5" /> Scan QR Instead
            </NavLink>
          </div>
        </div>
      </div>

      {/* MODAL: Guest Profile */}
      {showModal && userProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-xl border border-slate-100 overflow-hidden max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 shrink-0">
              <h5 className="font-bold text-slate-900 text-base mb-0">
                Confirm Guest Visit
              </h5>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto grow">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
                <UserAvatar
                  image={userProfile.photo}
                  firstName={userProfile.name || "Guest"}
                  size={72}
                  className="rounded-full shadow-sm"
                />
                <h6 className="font-bold text-slate-900 text-sm mt-3 mb-0 break-words">
                  {userProfile.name || "Guest"}
                </h6>
              </div>

              <div className="divide-y divide-slate-100">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-3 py-2.5"
                  >
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-700 font-medium text-right break-words min-w-0">
                      {item.value || "N/A"}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
                    Visit Status
                  </span>
                  <span
                    className={`px-2.5 py-1 font-semibold text-[10px] rounded-full capitalize ${
                      userProfile.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {userProfile.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/60 border-t border-slate-100 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-4">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isUpdating}
                className="w-full px-4 py-3.5 sm:py-3 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                  </>
                ) : userProfile.status === "confirmed" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Already Confirmed
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Confirm Visit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateByUniqueCode;
