import React from "react";

function TabPreRegisteredVisitors({ groupedVisits, loading }) {

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
                          {visit.visitor?.name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor?.contact_number || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor?.email || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor?.address || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {/* Access host name from the 'staff' relationship */}
                          {visit.host_name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {/* Format the check_in date for display */}
                          {visit.check_in
                            ? new Date(visit.check_in).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visit.visitor?.special_requirements || "None"}
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
    </div>
  );
}

export default TabPreRegisteredVisitors;
