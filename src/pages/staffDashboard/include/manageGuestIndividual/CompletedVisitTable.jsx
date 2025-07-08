import { useState, useEffect } from "react";
// import api from "../../../../context/api"; // Backend API import (commented out)

function CompletedVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // Dummy data replacing backend API call
        const dummyData = [
          {
            id: "12345",
            visitor: {
              name: "John Doe",
              contact_number: "08012345678",
              special_requirements: "Wheelchair Access",
            },
            host_name: "Jane Smith",
            check_in: new Date().toISOString(),
            created_at: "2025-07-06T09:30:00Z",
            updated_at: "2025-07-06T12:00:00Z",
          },
          {
            id: "67890",
            visitor: {
              name: "Alice Johnson",
              contact_number: "09098765432",
              special_requirements: "",
            },
            host_name: "Robert Brown",
            check_in: new Date().toISOString(),
            created_at: "2025-07-06T10:00:00Z",
            updated_at: "2025-07-06T11:45:00Z",
          },
        ];

        // Simulating setting data from a backend response
        // const response = await api.get("staff/guests/individual");
        // setVisits(response.data.visits);
        setVisits(dummyData); // Replacing with dummy data
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="table-responsive my-5">
        {visits.length > 0 ? (
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Unique ID</th>
                <th>Guest Name</th>
                <th>Host Name</th>
                <th>Visit Date/Time</th>
                <th>Contact Information</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Special Requirement</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.id}</td>
                  <td>{visit.visitor.name}</td>
                  <td>{visit.host_name}</td>
                  <td>{new Date(visit.check_in).toLocaleString()}</td>
                  <td>{visit.visitor.contact_number}</td>
                  <td>{visit.created_at}</td>
                  <td>{visit.updated_at}</td>
                  <td>{visit.visitor.special_requirements || "None"}</td> 
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h1>No Pre-Scheduled Visit</h1>
        )}
      </div>
    </div>
  );
}

export default CompletedVisitTable;
