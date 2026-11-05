import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../context/api";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import {
  X,
  ScanLine,
  ArrowRight,
  CheckCircle2,
  Loader2,
  User,
  ShieldCheck,
} from "lucide-react";
import UserAvatar from "../components/UserAvatar";

function SecurityDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
          const data = JSON.parse(decodedText);
          if (data && (data.id || data.visit_id || data.code)) {
            code = data.code || data.id || data.visit_id;
          }
        } catch {
          if (decodedText.startsWith("http")) {
            const urlParts = decodedText.split("/");
            code = urlParts[urlParts.length - 1];
          }
        }

        await fetchUserProfile(code);
      },
      (error) => {
        console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const fetchUserProfile = async (code) => {
    try {
      const response = await api.get(`/security/visit/scan/${code}`);
      setUserProfile(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Scan Error:", error);
      toast.error("No visitor record found for this code.");
    }
  };

  const handleConfirmVisit = async () => {
    if (!userProfile || !userProfile.visit_id) {
      toast.error("No visit data available.");
      return;
    }

    setConfirming(true);
    try {
      const response = await api.post(
        `/security/visit/confirm/${userProfile.visit_id}`
      );

      if (response.status === 200) {
        toast.success("Visit confirmed successfully!");
        setUserProfile((prev) => ({
          ...prev,
          security_confirmation: 1,
          status: "Confirmed",
        }));
        setShowModal(false);
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
        toast.error(
          error.response?.data?.message ||
            "An error occurred while confirming the visit."
        );
      }
    } finally {
      setConfirming(false);
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

  const steps = [
    {
      icon: ScanLine,
      title: "Scan the visitor code",
      text: "Use the camera or enter the unique code manually.",
    },
    {
      icon: User,
      title: "Verify visitor details",
      text: "Check the guest, host and visit information.",
    },
    {
      icon: ShieldCheck,
      title: "Confirm the visit",
      text: "Confirm to record security clearance for the visit.",
    },
  ];

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Page Header */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Guest Confirmation
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
          Scan a visitor QR code to verify and confirm their visit.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Scanner Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 mb-0">
                    Scan QR Code
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mb-0">
                    Position the visitor&apos;s code inside the frame.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 p-2.5 sm:p-4 flex items-center justify-center">
                <div
                  id="reader"
                  className="w-full max-w-[320px] overflow-hidden rounded-xl sm:rounded-2xl bg-white"
                ></div>
              </div>

              <NavLink
                to="/security-dashboard/generate-by-unique-code"
                className="mt-4 sm:mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all no-underline"
              >
                Enter Code Instead <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8 space-y-4">
              <h5 className="font-bold text-slate-900 text-sm mb-0">How it works</h5>
              <div className="space-y-2.5 sm:space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="flex items-start gap-3 p-3 sm:p-3.5 bg-slate-50/70 rounded-2xl"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 mb-0.5">
                          {index + 1}. {step.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mb-0 leading-snug">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Details Modal — bottom sheet on mobile, dialog on desktop */}
      {showModal && userProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-xl border border-slate-100 overflow-hidden print-tag max-h-[92dvh] flex flex-col"
            ref={printRef}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 shrink-0">
              <h5 className="font-bold text-slate-900 text-base mb-0">
                Visitor Details
              </h5>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border-0 cursor-pointer d-print-none shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto grow">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
                <UserAvatar
                  image={userProfile.photo}
                  firstName={userProfile.name || "Visitor"}
                  size={72}
                  className="rounded-full shadow-sm"
                />
                <h6 className="font-bold text-slate-900 text-sm mt-3 mb-0 break-words">
                  {userProfile.name || "Visitor"}
                </h6>
                <span
                  className={`mt-2 px-2.5 py-1 font-semibold text-[10px] rounded-full ${
                    userProfile.security_confirmation === 1
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {userProfile.security_confirmation === 1
                    ? "Confirmed"
                    : "Pending Confirmation"}
                </span>
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
                      userProfile.security_confirmation === 1
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {userProfile.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/60 border-t border-slate-100 d-print-none shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-4">
              {userProfile.security_confirmation === 1 ? (
                <button
                  type="button"
                  disabled
                  className="w-full px-4 py-3.5 sm:py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border-0"
                >
                  <CheckCircle2 className="w-4 h-4" /> Already Confirmed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmVisit}
                  disabled={confirming}
                  className="w-full px-4 py-3.5 sm:py-3 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer border-0 flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Confirm Visit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Keep the html5-qrcode widget fluid on small screens */
        #reader video,
        #reader canvas {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0.75rem;
        }
        #reader img[alt="Info icon"] {
          display: none;
        }
        #reader button {
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.5rem 0.875rem;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-tag, .print-tag * {
            visibility: visible;
          }
          .print-tag {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SecurityDashboard;
