import React from "react";
function TabPreRegisteredVisitors() {
  const visitorsData = [
    {
      name: "John Doe",
      contact: "123-456-7890",
      email: "john@example.com",
      address: "123 Street, NY",
      host: "Mr. Smith",
      date: "2025-03-07",
      special: "None",
    },
    {
      name: "Jane Smith",
      contact: "987-654-3210",
      email: "jane@example.com",
      address: "456 Avenue, LA",
      host: "Ms. Johnson",
      date: "2025-03-07",
      special: "Wheelchair Access",
    },
    {
      name: "Alice Brown",
      contact: "555-555-5555",
      email: "alice@example.com",
      address: "789 Blvd, TX",
      host: "Dr. Adams",
      date: "2025-03-06",
      special: "Vegan Meal",
    },
    {
      name: "Bob White",
      contact: "444-444-4444",
      email: "bob@example.com",
      address: "654 Road, FL",
      host: "Mr. Lee",
      date: "2025-03-06",
      special: "None",
    },
    {
      name: "Charlie Green",
      contact: "333-333-3333",
      email: "charlie@example.com",
      address: "321 Circle, WA",
      host: "Ms. Davis",
      date: "2025-03-05",
      special: "Sign Language Interpreter",
    },
    {
      name: "Daniel Blue",
      contact: "222-222-2222",
      email: "daniel@example.com",
      address: "159 Square, CO",
      host: "Mr. Miller",
      date: "2025-03-04",
      special: "None",
    },
    {
      name: "Emma Yellow",
      contact: "111-111-1111",
      email: "emma@example.com",
      address: "753 Lane, NV",
      host: "Ms. Wilson",
      date: "2025-03-03",
      special: "Gluten-Free Meal",
    },
  ];

  const groupedVisitors = visitorsData.reduce((acc, visitor) => {
    acc[visitor.date] = acc[visitor.date] || [];
    acc[visitor.date].push(visitor);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedVisitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div>
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
                {sortedDates.map((date, index) => (
                  <React.Fragment key={index}>
                    <tr className="table">
                      <td
                        colSpan="7"
                        className="py-4 "
                        style={{
                          backgroundColor: "#F5FAFE",
                        }}
                      >
                        {date === "2025-03-07" ? "Today" : date}
                      </td>
                    </tr>
                    {groupedVisitors[date].map((visitor, idx) => (
                      <tr key={idx}>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.name}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.contact}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.email}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.address}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.host}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.date}
                        </td>
                        <td className="text-muted" style={{ fontSize: "14px" }}>
                          {visitor.special}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabPreRegisteredVisitors;
