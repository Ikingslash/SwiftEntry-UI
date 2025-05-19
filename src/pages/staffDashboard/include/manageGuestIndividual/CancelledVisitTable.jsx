import { useState, useEffect } from "react";
import api from "../../../../context/api";

function CancelledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await api.get("staff/guests/individual");
        setVisits(response.data.visits);
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
    <div className="table-responsive my-5">
      {visits.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Visit Date</th>
              <th>Visit Time</th>
              <th>Contact Number</th> 
              <th>Special Requirement</th>
              <th>Visit Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* {visits.map((visitor) => (
              <tr key={visitor.id}>
                <td>{visitor.name}</td>
                <td>{new Date(visitor.created_at).toLocaleDateString()}</td>
                <td>{visitor.visit_time}</td> 
                <td>{visitor.contact_number}</td>
                <td>{visitor.special_requirements || "None"}</td>

                <td>{visitor.email}</td>
                <td>
                  <a href="#">Reschedule</a>
                </td>
              </tr>
            ))} */}
            {visits.map((visit) => (
                <tr key={visit.id}>
                  
                  <td>{visit.visitor.name}</td> 
                  <td>{new Date(visit.check_in).toLocaleString()}</td>
                  <td>{visit.visit_time}</td> 
                  <td>{visit.visitor.contact_number}</td> 
                  <td>{visit.visitor.special_requirements || "None"}</td> 
                  <td>{visit.status}</td>
                <td>
                  <a href="#">Reschedule</a>
                </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <h1>No Cancelled Visit</h1>
      )}
    </div>
  );
}

export default CancelledVisitTable;
