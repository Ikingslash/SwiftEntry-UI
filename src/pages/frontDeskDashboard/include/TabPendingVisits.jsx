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

function TabPendingVisits({ filters, searchQuery, refreshKey, onVisitAction }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPendingVisits();
  }, [refreshKey, filters, searchQuery, currentPage]);

  const fetchPendingVisits = async () => {
    setLoading(true);
    try {
      const visitorType = filters.group && !filters.individual ? "group" :
                         filters.individual && !filters.group ? "individual" : "all";

      const response = await api.get("/front-desk/guests/visits/pending", {
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
      console.error("Error fetching pending visits:", error);
      toast.error("Failed to fetch pending visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleConfirmVisit = async (visitId) => {
    try {
      await api.post(`/front-desk/visits/${visitId}/confirm`);
      toast.success("Visit confirmed successfully!");
      fetchPendingVisits();
      onVisitAction();
    } catch (error) {
      console.error("Error confirming visit:", error);
      toast.error(error.response?.data?.message || "Failed to confirm visit");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'bg-warning text-dark', text: 'Pending' },
      'scheduled_visit': { color: 'bg-info', text: 'Scheduled' },
      'pre_registered_visit': { color: 'bg-secondary', text: 'Pre-registered' },
      'Walk_In': { color: 'bg-primary', text: 'Walk-in' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.color}`}>{statusInfo.text}</span>;
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading pending visits...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No pending visits found</h5>
          <p className="text-muted">All visits are confirmed or completed</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {visits.map((visit) => (
              <div key={visit.id} className="col my-4">
                <div className="card h-100 shadow border-0 rounded-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="card-title mb-1 fw-bold">
                          {visit.visitor_name}
                        </h6>
                        <small className="text-muted">
                          {visit.visitor_email}
                        </small>
                      </div>
                      {getStatusBadge(visit.status)}
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted d-block">ID No</small>
                        <strong>{visit.visit_code}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Visit Time</small>
                        <strong>{visit.visit_time}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Host</small>
                        <strong>{visit.host_name}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Contact</small>
                        <strong>{visit.visitor_contact_number}</strong>
                      </div>

                      <div className="my-3 col-6">
                        <small className="text-muted d-block">Purpose</small>
                        <p className="mb-0">{visit.purpose}</p>
                      </div>

                      {visit.special_requirements &&
                        visit.special_requirements !== "None" && (
                          <div className="alert alert-warning my-3 col-6">
                            <small>
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              {visit.special_requirements}
                            </small>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="card-footer bg-light border-top-0">
                    <small className="text-muted">
                      Registered: {visit.registered_at}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="my-4">
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

export default TabPendingVisits;
