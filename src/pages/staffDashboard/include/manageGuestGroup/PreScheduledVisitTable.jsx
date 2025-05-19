import { useState, useEffect } from "react";
import api from "../../../../context/api";

function PreScheduledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await api.get("/staff/guests/group");
        setVisits(response.data.visits || []); // match response structure
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
            <thead>
              <tr>
                <th>Unique ID</th>
                <th>Leader Name</th>
                <th>Host Name</th>
                {/* <th>Visit Time</th> */}
                <th>Visit Date/Time</th>
                <th>Contact Information</th>
                <th>Email Address</th>
                {/* <th>Number of Guests</th> */}
                <th>Special Requirement</th>
                <th>Visit Status</th> 
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.id}</td>
                  <td>{visit.visitor?.name || "N/A"}</td>
                  <td>{visit.host_name}</td>
                  {/* <td>{visit.visit_time}</td> */}
                  <td>{new Date(visit.created_at).toLocaleString()}</td>
                  <td>{visit.visitor?.contact_number || "N/A"}</td>
                  <td>{visit.visitor?.email || "N/A"}</td>
                  {/* <td>{visit.group_size}</td> */} 
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

export default PreScheduledVisitTable;
