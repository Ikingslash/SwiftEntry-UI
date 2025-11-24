import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";

// Added visitType prop
function CancelledVisitTable({ visitType, onVisitUpdate }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const perPage = 10;

  const fetchVisits = async () => {
    setLoading(true);
    try {
        // FIX: Dynamic endpoint for cancelled visits
      const endpoint = `/front-desk/guests/${visitType}/cancelled-visits`;
      const response = await api.get(
        endpoint,
        {
          params: { per_page: perPage, page },
        }
      );
      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load cancelled visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page, visitType, onVisitUpdate]); // Added visitType and onVisitUpdate as dependencies

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page)
      setPage((prev) => prev + 1);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedVisit || !newDate || !newTime) {
        toast.error("Please select a new date and time.");
        return;
    }

    const newVisitTime = `${newDate} ${newTime}`;

    try {
        // Assume reschedule uses a generic visit ID endpoint
        await api.post(`security/guest/visit/${selectedVisit.id}/reschedule`, {
            visit_time: newVisitTime
        });
        toast.success("Visit successfully rescheduled!");
        setShowModal(false);
        fetchVisits();
        if(onVisitUpdate) onVisitUpdate();
    } catch (error) {
        console.error("Reschedule failed:", error);
        toast.error("Failed to reschedule visit.");
    }
  };

  const openRescheduleModal = (visit) => {
    setSelectedVisit(visit);
    // You might want to pre-fill date/time with current values or an empty string
    setNewDate("");
    setNewTime("");
    setShowModal(true);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="table-responsive my-5">
        {visits.length > 0 ? (
          <>
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Unique ID</th>
                  <th>Guest Name</th>
                  <th>Host Name</th>
                  <th>Visit Date/Time</th>
                  <th>Contact</th>
                  <th>Email Address</th>
                  <th>Special Requirement</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.id}</td>
                    <td>{visit.visitor?.name}</td>
                    <td>{visit.host_name}</td>
                    <td>
                      {visit.visit_time
                        ? new Date(visit.visit_time).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{visit.visitor?.contact_number}</td>
                    <td>{visit.visitor?.email}</td>
                    <td>{visit.visitor?.special_requirements || "None"}</td>
                     <td>
                        <button
                            className="btn btn-sm btn-info"
                            onClick={() => openRescheduleModal(visit)}
                        >
                            Reschedule
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-primary"
                onClick={handlePrevious}
                disabled={pagination.current_page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={pagination.current_page === pagination.last_page}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <h1>No Cancelled Visit</h1>
        )}
      </div>

      {/* Reschedule Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content p-4">
              <h5 className="modal-title">Reschedule Visit</h5>
              <div className="modal-body">
                <label>New Date</label>
                <input
                  type="date"
                  className="form-control mb-2"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />

                <label>New Time</label>
                <input
                  type="time"
                  className="form-control mb-3"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleRescheduleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancelledVisitTable;
