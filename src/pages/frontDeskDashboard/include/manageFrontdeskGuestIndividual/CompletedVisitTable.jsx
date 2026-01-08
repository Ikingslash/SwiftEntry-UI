import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";

// Added visitType prop
function CompletedVisitTable({ visitType }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchVisits();
  }, [page, visitType]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
        // FIX: Dynamic endpoint for completed visits
      const endpoint = `/front-desk/guests/${visitType}/completed-visits`;
      const response = await api.get(
        endpoint,
        {
          params: {
            per_page: perPage,
            page: page,
          },
        }
      );

      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to load completed visits"); // Added error toast
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pagination.current_page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) {
      setPage((prev) => prev + 1);
    }
  };
  if (loading) {
    return <p>Loading...</p>;
  }

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
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Duration</th>
                  <th>Contact</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Special Requirement</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => {
                  const calculateDuration = (checkIn, checkOut) => {
                    if (!checkIn || !checkOut) return 'N/A';
                    const diff = new Date(checkOut) - new Date(checkIn);
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${minutes}m`;
                  };

                  return (
                    <tr key={visit.id}>
                      <td>{visit.id}</td>
                      <td>{visit.visitor?.name || "N/A"}</td>
                      <td>{visit.host_name}</td>
                      <td>{new Date(visit.check_in).toLocaleString()}</td>
                      <td>{visit.check_out ? new Date(visit.check_out).toLocaleString() : 'N/A'}</td>
                      <td>{calculateDuration(visit.check_in, visit.check_out)}</td>
                      <td>{visit.visitor?.contact_number || "N/A"}</td>
                      <td>{visit.created_at}</td>
                      <td>{visit.updated_at}</td>
                      <td>{visit.visitor?.special_requirements || "None"}</td>
                    </tr>
                  );
                })}
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
          <h1>No Completed Visits</h1>
        )}
      </div>
    </div>
  );
}

export default CompletedVisitTable;
