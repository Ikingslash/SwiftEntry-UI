import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  Loader2,
  Clock,
  MapPin,
  User,
} from "lucide-react";

function VisitorVisitCard({ visit, onActionComplete }) {
  const [loading, setLoading] = useState(false);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700";
      case "checked_in":
        return "bg-sky-50 text-sky-700";
      case "checked_out":
        return "bg-slate-100 text-slate-600";
      case "pending":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "checked_in":
        return "Checked In";
      case "checked_out":
        return "Checked Out";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post(`/self-service/visits/${visit.id}/check-in`);
      toast.success("Checked in successfully!");
      setTimeout(() => {
        onActionComplete();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to check in");
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post(`/self-service/visits/${visit.id}/check-out`);
      toast.success("Checked out successfully!");
      setTimeout(() => {
        onActionComplete();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to check out");
      setLoading(false);
    }
  };

  // Show Check In button only if not yet checked in
  const canCheckIn =
    visit.visit_status === "confirmed" || visit.visit_status === "pending";
  // Show Check Out button only if already checked in
  const canCheckOut = visit.visit_status === "checked_in";
  const isCheckedOut = visit.visit_status === "checked_out";

  const details = [
    { label: "Visit Purpose", value: visit.purpose || "N/A", icon: MapPin },
    { label: "Host", value: visit.host_name || "N/A", icon: User },
    {
      label: "Visit Time",
      value: visit.visit_time
        ? new Date(visit.visit_time).toLocaleString()
        : "N/A",
      icon: Clock,
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm mb-0.5 break-words">
            {visit.visitor?.name || "Unknown Visitor"}
          </h3>
          <p className="text-[11px] text-slate-500 mb-0">
            Visit Code:{" "}
            <span className="font-bold text-slate-700">{visit.code}</span>
          </p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeColor(
            visit.visit_status
          )}`}
        >
          {getStatusText(visit.visit_status)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 py-4 space-y-4 flex-1">
        {/* Security Confirmation Status */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold ${
            visit.security_confirmation
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {visit.security_confirmation ? (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>
            Security Status:{" "}
            {visit.security_confirmation ? "Confirmed" : "Pending Confirmation"}
          </span>
        </div>

        {/* Visit Details */}
        <div className="space-y-3">
          {details.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="text-xs text-slate-800 font-medium mb-0 break-words">
                  {value}
                </p>
              </div>
            </div>
          ))}

          {visit.visit_details && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Details
                </p>
                <p className="text-xs text-slate-800 font-medium mb-0 break-words">
                  {visit.visit_details}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Check-in/Check-out Times */}
        {(visit.check_in || visit.check_out) && (
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            {visit.check_in && (
              <p className="text-[11px] text-slate-600 mb-0">
                <span className="font-bold text-slate-700">Checked In:</span>{" "}
                {new Date(visit.check_in).toLocaleString()}
              </p>
            )}
            {visit.check_out && (
              <p className="text-[11px] text-slate-600 mb-0">
                <span className="font-bold text-slate-700">Checked Out:</span>{" "}
                {new Date(visit.check_out).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer - Action Buttons */}
      {!isCheckedOut && (canCheckIn || canCheckOut) && (
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          {canCheckIn && (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Checking In..." : "Check In"}
            </button>
          )}
          {canCheckOut && (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {loading ? "Checking Out..." : "Check Out"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VisitorVisitCard;
