import { useState, useEffect } from "react";
// import api from "../../../../context/api"; // Commented out backend API

function PreScheduledVisitTable() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // Dummy data to replace backend response
        const dummyData = {
          visits: [
            {
              id: "001",
              visitor: {
                name: "John Doe",
                contact_number: "08012345678",
                email: "john@example.com",
                special_requirements: "Wheelchair access",
              },
              host_name: "Jane Smith",
              created_at: new Date().toISOString(),
              status: "Scheduled",
              // group_size: 5,
            },
            {
              id: "002",
              visitor: {
                name: "Mary Johnson",
                contact_number: "09087654321",
                email: "mary@example.com",
                special_requirements: "",
              },
              host_name: "Michael Brown",
              created_at: new Date().toISOString(),
              status: "Pending",
              // group_size: 3,
            },
          ],
        };

        // Simulate delay like an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // const response = await api.get("/staff/guests/group");
        // setVisits(response.data.visits || []);
        setVisits(dummyData.visits); // Use dummy data instead of API response
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
