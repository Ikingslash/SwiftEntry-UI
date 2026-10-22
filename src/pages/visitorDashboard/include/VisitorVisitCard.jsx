import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";

function VisitorVisitCard({ visit, onActionComplete }) {
  const [loading, setLoading] = useState(false);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "checked_in":
        return "bg-info";
      case "checked_out":
        return "bg-secondary";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
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
  const canCheckIn = visit.visit_status === "confirmed" || visit.visit_status === "pending";
  // Show Check Out button only if already checked in
  const canCheckOut = visit.visit_status === "checked_in";
  const isCheckedOut = visit.visit_status === "checked_out";

  return (
    <>
      <div
        className="card h-100 shadow-sm border-0"
        style={{
          borderLeft: "5px solid #053561",
        }}
      >
        {/* Header */}
        <div className="card-header" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title fw-bold mb-1">
                {visit.visitor?.name || "Unknown Visitor"}
              </h5>
              <small className="text-muted">
                Visit Code: <strong>{visit.code}</strong>
              </small>
            </div>
            <span className={`badge ${getStatusBadgeColor(visit.visit_status)}`}>
              {getStatusText(visit.visit_status)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="card-body">
          {/* Security Confirmation Status */}
          <div className="alert alert-info mb-3" role="alert">
            <i className="bi bi-shield-check me-2"></i>
            <strong>Security Status:</strong>
            {visit.security_confirmation ? (
              <span className="ms-2">
                <i className="bi bi-check-circle text-success"></i> Confirmed
              </span>
            ) : (
              <span className="ms-2">
                <i className="bi bi-clock text-warning"></i> Pending Confirmation
              </span>
            )}
          </div>

          {/* Visit Details */}
          <div className="mb-3">
            <label className="small text-muted fw-bold">VISIT PURPOSE</label>
            <p className="mb-2">{visit.purpose || "N/A"}</p>

            <label className="small text-muted fw-bold">HOST</label>
            <p className="mb-2">{visit.host_name || "N/A"}</p>



            <label className="small text-muted fw-bold">VISIT TIME</label>
            <p className="mb-3">
              {visit.visit_time
                ? new Date(visit.visit_time).toLocaleString()
                : "N/A"}
            </p>

            {visit.visit_details && (
              <>
                <label className="small text-muted fw-bold">DETAILS</label>
                <p className="mb-3">{visit.visit_details}</p>
              </>
            )}
          </div>

          {/* Check-in/Check-out Times */}
          {(visit.check_in || visit.check_out) && (
            <div className="border-top pt-3 mt-3">
              {visit.check_in && (
                <p className="mb-1">
                  <strong>Checked In:</strong>
                  {" "}
                  {new Date(visit.check_in).toLocaleString()}
                </p>
              )}
              {visit.check_out && (
                <p>
                  <strong>Checked Out:</strong>
                  {" "}
                  {new Date(visit.check_out).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="card-footer" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="d-grid gap-2">
            {!isCheckedOut && (
              <>
                {canCheckIn && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleCheckIn}
                    disabled={loading}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    {loading ? "Checking In..." : "Check In"}
                  </button>
                )}
                {canCheckOut && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handleCheckOut}
                    disabled={loading}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {loading ? "Checking Out..." : "Check Out"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>


    </>
  );
}

export default VisitorVisitCard;
