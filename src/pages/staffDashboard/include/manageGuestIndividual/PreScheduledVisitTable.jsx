import { useState, useEffect } from "react";
// import api from '../../../../context/api'; // Commented out backend import

function PreScheduledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // Simulate API response with dummy data
        const dummyData = {
          visits: [
            {
              id: "VIS123",
              visitor: {
                name: "John Doe",
                contact_number: "08012345678",
                email: "johndoe@example.com",
                special_requirements: "Wheelchair access",
              },
              host_name: "Mr. Smith",
              check_in: "2025-07-07T10:30:00Z",
            },
            {
              id: "VIS124",
              visitor: {
                name: "Jane Roe",
                contact_number: "08087654321",
                email: "janeroe@example.com",
                special_requirements: null,
              },
              host_name: "Ms. Johnson",
              check_in: "2025-07-08T14:00:00Z",
            },
          ],
        };

        // Simulate delay like a real API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Replace actual API call with dummy data
        // const response = await api.get('staff/guests/individual');
        // setVisits(response.data.visits);
        setVisits(dummyData.visits);
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
              <th>Email Address</th>
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
                <td>{visit.visitor.email}</td>
                <td>{visit.visitor.special_requirements || 'None'}</td>
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

export default PreScheduledVisitTable;
