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
        // Commenting out actual API fetch for demo/testing purposes
        /*
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
        */

        // Dummy static data simulating API response
        const dummyData = [
          {
            full_name: "Jane Doe",
            phone_number: "1234567890",
            email_address: "jane@example.com",
            residential_address: "123 ABC Street",
            host_name: "Mr. Smith",
            date_of_visit: "2024-07-02",
            special_request: "Wheelchair assistance",
          },
          {
            full_name: "John Smith",
            phone_number: "0987654321",
            email_address: "john@example.com",
            residential_address: "456 XYZ Avenue",
            host_name: "Ms. Johnson",
            date_of_visit: "2024-07-02",
            special_request: "None",
          },
          {
            full_name: "Alice Brown",
            phone_number: "1112223333",
            email_address: "alice@example.com",
            residential_address: "789 QWE Road",
            host_name: "Dr. Lee",
            date_of_visit: "2024-07-05",
            special_request: "Interpreter",
          },
          {
            full_name: "Bob Green",
            phone_number: "4445556666",
            email_address: "bob@example.com",
            residential_address: "321 RTY Blvd",
            host_name: "Prof. Alan",
            date_of_visit: "2024-06-28",
            special_request: "N/A",
          },
        ];

        // Simulate filtering by month
        const filteredData = month
          ? dummyData.filter((item) =>
              new Date(item.date_of_visit).toLocaleString("default", { month: "long" }) === month
            )
          : dummyData;

        // Simulate filtering by visitorType if needed (optional)
        // Add a visitor_type field in dummy data if needed

        setVisitorsData(filteredData);
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
        const visitDate = visitor.date_of_visit;
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
