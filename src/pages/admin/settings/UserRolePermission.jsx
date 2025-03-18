import React from "react";

function UserRolePermission() {

  const visitorsData = [
    {
      name: "Henry Riggs",
      hostName: "Henry Riggs",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Individual",
      checkedIn: "-----",
      checkedOut: "-----",
    },
    {
      name: "Maya Luke",
      hostName: "Maya Luke",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Sales Department",
      checkedIn: "-----",
      checkedOut: "-----",
    },
    {
      name: "Mary Smith",
      hostName: "Mary Smith",
      visitDateTime: "12/10/24, 3:00pm",
      visitType: "Group",
      checkedIn: "-----",
      checkedOut: "-----",
    },
    {
      name: "Henry Riggs",
      hostName: "Henry Riggs",
      visitDateTime: "13/10/24, 3:00pm",
      visitType: "Individual",
      checkedIn: "-----",
      checkedOut: "-----",
    },
    {
      name: "Maya Luke",
      hostName: "Maya Luke",
      visitDateTime: "13/10/24, 3:00pm",
      visitType: "Sales Department",
      checkedIn: "-----",
      checkedOut: "-----",
    },
    {
      name: "Mary Smith",
      hostName: "Mary Smith",
      visitDateTime: "11/10/24, 3:00pm",
      visitType: "Group",
      checkedIn: "-----",
      checkedOut: "-----",
    },
  ];
  const groupedVisitors = visitorsData.reduce((acc, visitor) => {
    const visitDate = visitor.visitDateTime.split(",")[0];
    acc[visitDate] = acc[visitDate] || [];
    acc[visitDate].push(visitor);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedVisitors).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  return (
    <div>
      <div className="container">
      <div className="table-responsive my-5">
        <table className="table table-bordered table-hover">
          <thead className="bg-white">
            <tr>
              <th>Name</th>
              <th>Host Name</th>
              <th>Visit Date/Time</th>
              <th>Visit Type</th>
              <th>Checked In</th>
              <th>Checked Out</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date, index) => (
              <React.Fragment key={index}>
                <tr className="table">
                  <td
                    colSpan="7"
                    className="py-3"
                    style={{ backgroundColor: "#F5FAFE" }}
                  >
                    {date === "12/10/24" ? "Today" : date}
                  </td>
                </tr>
                {groupedVisitors[date].map((visitor, idx) => (
                  <tr key={idx}>
                    <td>{visitor.name}</td>
                    <td>{visitor.hostName}</td>
                    <td>{visitor.visitDateTime}</td>
                    <td>{visitor.visitType}</td>
                    <td>{visitor.checkedIn}</td>
                    <td>{visitor.checkedOut}</td>
                    <td className="text-center">
                      <div className="dropdown">
                        <button
                          className="btn btn-white border-primary"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu bg-light rounded-4" style={{ fontSize: "13px", width: "250px" }}>
                          <li>
                            <button className="dropdown-item">
                              Edit Info
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              Invite Again
                            </button>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button className="dropdown-item text-danger">Delete Visit</button>
                          </li>
                        </ul>
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
    </div>
  );
}
 

export default UserRolePermission;
