import { useState, useEffect } from "react";
import api from "../../../../context/api"; // Commented out backend API import

function MissedVisitTable() {
const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const response = await api.get('staff/guests/group-missed-visit', {
          params: {
            per_page: perPage,
            page: page,
          },
        });

        setVisits(response.data.visits);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [page]);

  const handlePrevious = () => {
    if (pagination.current_page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) {
      setPage(prev => prev + 1);
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
              <th>Visit Date/Time</th>
              <th>Contact Information</th>
              <th>Email Address</th>
              <th>Special Requirement</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.id}>
                <td>{visit.id}</td>
                <td>{visit.visitor?.name}</td>
                <td>{visit.host_name}</td>
                <td>{new Date(visit.check_in).toLocaleString()}</td>
                <td>{visit.visitor?.contact_number}</td>
                <td>{visit.visitor?.email}</td>
                <td>{visit.visitor?.special_requirements || 'None'}</td>
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
            <h1>No Missed  Visit</h1>
          )}
      </div>
    </div>
  );
}

export default MissedVisitTable;
