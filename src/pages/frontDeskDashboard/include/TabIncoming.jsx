import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';

const Pagination = ({ pagination, handlePageChange }) => {
  const { current_page, last_page } = pagination;
  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={() => handlePageChange(current_page - 1)}
          >
            Previous
          </a>
        </li>
        {pages.map(page => (
          <li key={page} className={`page-item ${current_page === page ? 'active' : ''}`}>
            <a
              className="page-link"
              href="#"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </a>
          </li>
        ))}
        <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={() => handlePageChange(current_page + 1)}
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};

function TabIncoming({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    fetchIncomingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchIncomingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
        filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/incoming", {
        params: {
          visitor_type: visitorType,
          search: searchQuery,
          per_page: 8,
          page: currentPage,
        },
      });

      setVisits(response.data.visits || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching incoming visits:", error);
      toast.error("Failed to fetch incoming visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckOut = async (visitId) => {
    try {
      await api.post(`/front-desk/guests/visits/${visitId}/check-out`);
      toast.success("Visitor checked out successfully!");
      fetchIncomingVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error(error.response?.data?.message || "Failed to check out visitor");
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not checked in';

    // Manually parse "YYYY-MM-DD HH:mm:ss" to ensure strict UTC interpretation
    // This avoids browser inconsistencies with string parsing
    let date;
    if (typeof dateTime === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
      const parts = dateTime.split(/[- :]/);
      // Date.UTC(year, monthIndex, day, hour, minute, second)
      date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
    } else {
      // Fallback for other formats (ISO with Z, etc)
      const utcString = (dateTime.includes('Z') || dateTime.includes('+'))
        ? dateTime
        : dateTime.replace(' ', 'T') + 'Z';
      date = new Date(utcString);
    }

    // If still invalid, give up and return original string
    if (isNaN(date.getTime())) return dateTime;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading incoming visits...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-door-open fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No incoming visits</h5>
          <p className="text-muted">Check in visitors from Confirmed tab</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {visits.map((visit) => (
              <div key={visit.id} className="col my-4">
                <div className="card h-100 shadow border-start border-4 border-primary rounded-3">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1 fw-bold">
                          {visit.visitor_name}
                        </h6>
                        <small className="text-muted">
                          {visit.visitor_email}
                        </small>
                      </div>
                      <span className="badge bg-primary">Checked In</span>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">ID No</small>
                        <strong>{visit.visit_code}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">
                          Check-in Time
                        </small>
                        <strong>{formatDateTime(visit.check_in)}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Host</small>
                        <strong>{visit.host_name}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Duration</small>
                        <strong>
                          {visit.check_in
                            ? (() => {
                              const diff = new Date() - new Date(visit.check_in);
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()
                            : "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <i className="text-muted fs-6"></i>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (
                            window.confirm(`Check out ${visit.visitor_name}?`)
                          ) {
                            handleCheckOut(visit.id);
                          }
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-1"></i> Check Out
                      </button>
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0">
                    <small className="text-muted">
                      <i className="bi bi-clock-history me-1"></i>
                      Currently visiting for{" "}
                      {visit.check_in
                        ? (() => {
                          const diff = new Date() - new Date(visit.check_in);
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours}h ${minutes}m`;
                        })()
                        : "a while"}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                pagination={pagination}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TabIncoming;
