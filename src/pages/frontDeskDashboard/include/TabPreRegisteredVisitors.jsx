import React from "react";

const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || !pagination.last_page) return null;
  const { current_page, last_page } = pagination;
  const pages = [];
  for (let i = 1; i <= last_page; i++) {
    pages.push(i);
  }
  if (pages.length === 0) return null;

  return (

  <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${current_page === 1 ? "disabled" : ""}`}>
          <a
            className="page-link"
            href="#"
            onClick={() => handlePageChange(current_page - 1)}
            aria-label="Previous"
          >
            Previous
          </a>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${current_page === page ? "active" : ""}`}
          >
            <a
              className="page-link"
              href="#"
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}

            >
              {page}
            </a>
          </li>
        ))}
        <li
          className={`page-item ${
            current_page === last_page ? "disabled" : ""
          }`}
        >
          <a
            className="page-link"
            href="#"
            aria-label="Next"
            onClick={() => handlePageChange(current_page + 1)}
            disabled={current_page === last_page}


          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};


function TabPreRegisteredVisitors({
  groupedVisits,
  loading,
  pagination,
  handlePageChange,
}) {
  const sortedDates = Object.keys(groupedVisits || {}).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) return <p className="text-center">Loading visitors...</p>;
  if (!groupedVisits || sortedDates.length === 0)
    return <p className="text-center">No visitor history found.</p>;

  return (
    <div>
      <div className="row mb-5">
        <div className="container mt-3">
          <div className="table-responsive my-5">
            <table className="table table-bordered table-hover">
              <thead className="table-white">
                <tr>
                  <th>Name</th>
                  <th>Contact Information</th>
                  <th>Email Address</th>
                  <th>Address</th>
                  <th>Host Name</th>
                  <th>Visit Date</th>
                  <th>Special Requirement</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((date, index) => (
                  <React.Fragment key={index}>
                    <tr className="table">
                      <td
                        colSpan="7"
                        className="py-4"
                        style={{ backgroundColor: "#F5FAFE" }}
                      >
                        {date === new Date().toISOString().split("T")[0]
                          ? "Today"
                          : date}
                      </td>
                    </tr>
                    {groupedVisits[date].map((visit, idx) => (
                      <tr key={idx}>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor_name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor_contact_number || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor_email || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor_address || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.host_name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visit_date || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.special_requirements || "None"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        {pagination && pagination.last_page > 1 && (
          <Pagination
            pagination={pagination}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default TabPreRegisteredVisitors;
