
import { useState, useEffect } from "react";
import api from "../../../../context/api";


function CancelledVisitTable() {
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
