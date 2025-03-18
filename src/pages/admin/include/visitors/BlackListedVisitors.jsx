import React from "react";

function BlackListedVisitors() {


  const visitorsData = [
    {
      name: "John Doe",
      contact: "123-456-7890",
      email: "john@example.com",
      address: "123 Street, NY",
      date: "2025-03-07",
    },
    {
      name: "Jane Smith",
      contact: "987-654-3210",
      email: "jane@example.com",
      address: "456 Avenue, LA",
      date: "2025-03-07",
    },
    {
      name: "Alice Brown",
      contact: "555-555-5555",
      email: "alice@example.com",
      address: "789 Blvd, TX",
      date: "2025-03-06",
    },
    {
      name: "Bob White",
      contact: "444-444-4444",
      email: "bob@example.com",
      address: "654 Road, FL",
      date: "2025-03-06",
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
    <div className="container">
      <div className="table-responsive my-5">
        <table className="table table-bordered table-hover">
          <thead className="bg-white">
            <tr>
              <th>Name</th>
              <th>Contact Information</th>
              <th>Email Address</th>
              <th>Address</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date, index) => (
              <React.Fragment key={index}>
                <tr className="table">
                  <td
                    colSpan="5"
                    className="py-3"
                    style={{
                      backgroundColor: "#F5FAFE",
                    }}
                  >
                    {date === "2025-03-07" ? "Today" : date}
                  </td>
                </tr>
                {groupedVisitors[date].map((visitor, idx) => (
                  <tr key={idx}>
                    <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.name}</td>
                    <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.contact}</td>
                    <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.email}</td>
                    <td className="text-muted" style={{ fontSize: "14px" }}>{visitor.address}</td>
                    <td className="text-center">
                      <div className="dropdown">
                        <button
                          className="btn btn-white border-primary"
                          
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        {/* <ul className="dropdown-menu bg-light rounded-4" style={{ fontSize: "13px", width: "250px" }} >
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(visitor)}
                            >
                               Edit Info
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              Remove From VIP
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item text-danger">
                              Blacklist Guest
                            </button>
                          </li> 
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button className="dropdown-item text-danger">
                               Delete
                            </button>
                          </li>
                        </ul> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 

export default BlackListedVisitors;
