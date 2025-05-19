import React, { useEffect, useState } from "react";

function TabWalkInVisitors({ month, visitorType }) {
  const [visitorsData, setVisitorsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams();

        if (month) queryParams.append("month", month);
        if (visitorType && visitorType !== "all" && visitorType !== "") {
          queryParams.append("visitor_type", visitorType);
        }

        const response = await fetch(
          `https://vms-api.194.62.98.28.nip.io/api/front-desk/history/walk-ins?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorRes = await response.json();
          throw new Error(errorRes.message || "Failed to fetch walk-in visitors");
        }

        const result = await response.json();
        console.log("Walk-in visitors API response:", result);
        setVisitorsData(result.visits || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, [month, visitorType]);

  const groupedVisitors = Array.isArray(visitorsData)
    ? visitorsData.reduce((acc, visitor) => {
        const visitDate = visitor.date_of_visit; // use correct field name
        acc[visitDate] = acc[visitDate] || [];
        acc[visitDate].push(visitor);
        return acc;
      }, {})
    : {};

  const sortedDates = Object.keys(groupedVisitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) return <p>Loading walk-in visitors...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
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
              {sortedDates.length > 0 ? (
                sortedDates.map((date, index) => (
                  <React.Fragment key={index}>
                    <tr className="table">
                      <td
                        colSpan="7"
                        className="py-4"
                        style={{
                          backgroundColor: "#F5FAFE",
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#000",
                        }}
                      >
                        {new Date(date).toDateString()}
                      </td>
                    </tr>
                    {groupedVisitors[date].map((visitor, idx) => (
                      <tr key={idx}>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.full_name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.phone_number || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.email_address || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.residential_address || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.host_name || "N/A"}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {new Date(visitor.date_of_visit).toLocaleDateString()}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.special_request || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No walk-in visitors found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TabWalkInVisitors;
