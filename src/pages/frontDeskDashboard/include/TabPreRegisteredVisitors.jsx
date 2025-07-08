import React, { useEffect, useState } from "react";

function TabPreRegisteredVisitors({ month, visitorType }) {
  const [visitorsData, setVisitorsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      setError(null);
      try {
        // === BACKEND CODE COMMENTED OUT ===
        /*
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams();
        if (month) queryParams.append("month", month);
        if (visitorType && visitorType !== "all")
          queryParams.append("visitor_type", visitorType);

        const response = await fetch(
          `https://vms-api.194.62.98.28.nip.io/api/front-desk/history?${queryParams.toString()}`,
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
          throw new Error(errorRes.message || "Failed to fetch visitor data");
        }

        const result = await response.json();
        console.log("API response:", result);
        setVisitorsData(result.visits || []);
        */

        // === DUMMY DATA USED INSTEAD ===
        const dummyData = [
          {
            date: "2025-07-06",
            host_name: "Mr. James",
            visitor: {
              name: "John Doe",
              contact_number: "08012345678",
              email: "john@example.com",
              address: "123 Street, Lagos",
              special_requirements: "Wheelchair access",
            },
          },
          {
            date: "2025-07-06",
            host_name: "Mrs. Linda",
            visitor: {
              name: "Jane Smith",
              contact_number: "08098765432",
              email: "jane@example.com",
              address: "456 Avenue, Abuja",
              special_requirements: "",
            },
          },
          {
            date: "2025-07-05",
            host_name: "Dr. Mike",
            visitor: {
              name: "Peter Obi",
              contact_number: "08011223344",
              email: "peter@example.com",
              address: "789 Road, Port Harcourt",
              special_requirements: "Interpreter needed",
            },
          },
        ];

        setVisitorsData(dummyData);
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
        const visitDate = visitor.date;
        acc[visitDate] = acc[visitDate] || [];
        acc[visitDate].push(visitor);
        return acc;
      }, {})
    : {};

  const sortedDates = Object.keys(groupedVisitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) return <p>Loading visitors...</p>;
  if (error) return <p>Error: {error}</p>;

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
                        className="py-4 "
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
                        <td>{visitor.visitor?.name}</td>
                        <td>{visitor.visitor?.contact_number}</td>
                        <td>{visitor.visitor?.email}</td>
                        <td>{visitor.visitor?.address}</td>
                        <td>{visitor.host_name}</td>
                        <td>{new Date(visitor.date).toLocaleDateString()}</td>
                        <td>{visitor.visitor?.special_requirements || "N/A"}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {sortedDates.length === 0 && (
              <div className="text-center mt-4">
                <p>No visitors found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabPreRegisteredVisitors;
