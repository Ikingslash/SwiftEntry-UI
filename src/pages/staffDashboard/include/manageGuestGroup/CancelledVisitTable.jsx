import { useState, useEffect } from "react";
import api from "../../../../context/api";

function CancelledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const perPage = 10;

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const response = await api.get("staff/guests/group-cancelled-visit", {
          params: { per_page: perPage, page },
        });
        setVisits(response.data.visits);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching visits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [page]);

  const handlePrevious = () => {
    if (pagination.current_page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) setPage((prev) => prev + 1);
  };

  const handleRescheduleClick = (visit) => {
    setSelectedVisit(visit);
    setNewDate("");
    setNewTime("");
    setShowModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTime) {
      alert("Date and time are required");
      return;
    }

    try {
      // Reschedule visit
      await api.put(`staff/guests/group/reschedule/${selectedVisit.visitor.id}`, {
        new_date: newDate,
        new_time: newTime,
      });

      // Notify visitor
      await api.post("staff/guests/notify", {
        visitor_id: selectedVisit.visitor.id,
        message: `Your visit has been rescheduled to ${newDate} at ${newTime}`,
      });

      alert("Rescheduled and notification sent!");
      setShowModal(false);
    } catch (error) {
      console.error("Reschedule error:", error);
      alert("Failed to reschedule or notify.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="table-responsive my-5">
      {visits.length > 0 ? (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Visit Date</th>
                <th>Visit Time</th>
                <th>Contact Number</th>
                <th>Special Requirement</th>
                <th>Visit Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.visitor?.name || "N/A"}</td>
                  <td>{new Date(visit.check_in).toLocaleDateString()}</td>
                  <td>{visit.visit_time || "N/A"}</td>
                  <td>{visit.visitor?.contact_number || "N/A"}</td>
                  <td>{visit.visitor?.special_requirements || "None"}</td>
                  <td>{visit.status}</td>
                  <td>
                    <button className="btn btn-sm btn-link" onClick={() => handleRescheduleClick(visit)}>
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-primary" onClick={handlePrevious} disabled={pagination.current_page === 1}>
              Previous
            </button>
            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button className="btn btn-primary" onClick={handleNext} disabled={pagination.current_page === pagination.last_page}>
              Next
            </button>
          </div>
        </>
      ) : (
        <h5>No Cancelled Visits</h5>
      )}

      {/* Reschedule Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content p-4">
              <h5 className="modal-title">Reschedule Visit</h5>
              <div className="modal-body">
                <label>New Date</label>
                <input type="date" className="form-control mb-2" value={newDate} onChange={(e) => setNewDate(e.target.value)} />

                <label>New Time</label>
                <input type="time" className="form-control mb-3" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleRescheduleSubmit}>
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
