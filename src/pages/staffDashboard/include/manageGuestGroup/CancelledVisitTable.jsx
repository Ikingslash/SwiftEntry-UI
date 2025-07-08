
import { useState, useEffect } from "react";
// import api from "../../../../context/api"; // Commented out backend API

function CancelledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch from backend with dummy data
    const fetchVisits = async () => {
      try {
        // const response = await api.get("/staff/guests/group");
        // setVisits(response.data.visits || []); // match response structure

        // Dummy data to replace backend response
        const dummyData = [
          {
            id: 1,
            created_at: "2025-07-05T10:00:00Z",
            visit_time: "2:00 PM",
            status: "Cancelled",
            visitor: {
              name: "John Doe",
              contact_number: "08012345678",
              special_requirements: "Wheelchair access"
            }
          },
          {
            id: 2,
            created_at: "2025-07-06T14:30:00Z",
            visit_time: "4:00 PM",
            status: "Cancelled",
            visitor: {
              name: "Jane Smith",
              contact_number: "08087654321",
              special_requirements: "Interpreter needed"
            }
          }
        ];

        setVisits(dummyData);
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
              <th>Guest Name</th>
              <th>Visit Date</th>
              <th>Visit Time</th>
              <th>Contact Information</th>
              <th>Special Requirement</th>
              <th>Visit Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody> 
            {visits.map((visit) => (
                <tr key={visit.id}>
                 
                  <td>{visit.visitor?.name || "N/A"}</td>
                  <td>{new Date(visit.created_at).toLocaleString()}</td>
                  <td>{visit.visit_time}</td> 
                  <td>{visit.visitor?.contact_number || "N/A"}</td> 
                  <td>{visit.visitor?.special_requirements || "None"}</td>
                  <td>{visit.status}</td>
                  <td>
                  <a href="#">Reschedule</a>
                </td>
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

export default CancelledVisitTable;
