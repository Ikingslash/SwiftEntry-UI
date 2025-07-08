import { useState, useEffect } from "react";
// import api from "../../../../context/api"; // backend import commented out

function CompletedVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // Backend call is commented out
        // const response = await api.get("/staff/guests/group");
        // setVisits(response.data.visits || []);

        // Dummy data to simulate API response
        const dummyData = [
          {
            id: "VIS123456",
            visitor: {
              name: "John Doe",
              contact_number: "08123456789",
              special_requirements: "Wheelchair access"
            },
            host_name: "Jane Smith",
            created_at: "2025-07-06T09:30:00Z",
            updated_at: "2025-07-06T12:00:00Z"
          },
          {
            id: "VIS654321",
            visitor: {
              name: "Alice Johnson",
              contact_number: "08099887766",
              special_requirements: ""
            },
            host_name: "Dr. Albert",
            created_at: "2025-07-05T10:00:00Z",
            updated_at: "2025-07-05T11:30:00Z"
          }
        ];

        setVisits(dummyData); // use dummy data instead
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  if (loading) return <p>Loading...</p>;


  return (
    <div>
      <div className="table-responsive my-5">
        {visits.length > 0 ? (
          <table className="table table-bordered table-hover">
            <thead className="">
              <tr>
                <th>Unique ID</th>
                <th>Leader Name</th>
                <th>Host Name</th>
                <th>Visit Date/Time</th> 
                <th>Contact Information</th>
                <th>Check In</th>
                <th>Contact Out</th> 
                <th>Special Requirements</th> 
              </tr>
            </thead>
            <tbody>
            {visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.id}</td>
                  <td>{visit.visitor?.name || "N/A"}</td>
                  <td>{visit.host_name}</td> 
                  <td>{new Date(visit.created_at).toLocaleString()}</td>
                  <td>{visit.visitor?.contact_number || "N/A"}</td>
                  <td>{visit.created_at}</td>
                  <td>{visit.updated_at}</td>
                  <td>{visit.visitor?.special_requirements || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h1>No Data Available</h1>
        )}
      </div>
    </div>
  );
}

export default CompletedVisitTable;
