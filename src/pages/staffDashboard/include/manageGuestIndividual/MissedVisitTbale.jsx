import { useState, useEffect } from "react";
// import api from "../../../../context/api"; // Commented out backend API import

function MissedVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // const response = await api.get("staff/guests/individual");
        // setVisits(response.data.visits);

        // Dummy data used to simulate response
        const dummyData = [
          {
            id: "VST001",
            visitor: {
              name: "John Doe",
              contact_number: "08012345678",
              email: "johndoe@example.com",
              special_requirements: "Wheelchair access"
            },
            host_name: "Jane Smith",
            check_in: new Date().toISOString(),
          },
          {
            id: "VST002",
            visitor: {
              name: "Mary Johnson",
              contact_number: "08098765432",
              email: "maryj@example.com",
              special_requirements: "",
            },
            host_name: "Michael Brown",
            check_in: new Date().toISOString(),
          }
        ];

        setVisits(dummyData); // Use dummy data
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
            <h1>No Missed  Visit</h1>
          )}
      </div>
    </div>
  );
}

export default MissedVisitTable;
