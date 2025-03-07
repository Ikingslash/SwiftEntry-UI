function PreScheduledVisitTable() {
  return (
    <div>
      <div className="table-responsive my-5">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Leader Name</th>
              <th>Host Name</th>
              <th>Visit Time</th>
              <th>Visit Date/Time</th>
              <th>Contact Information</th>
              <th>Number of Guest</th>
              <th>Special Requirement</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>John Doe</td>
              <td>Dr. Smith</td>
              <td>2024-02-17 10:30 AM</td>
              <td>+1234567890</td>
              <td>john.doe@email.com</td>
              <td>Wheelchair Access</td>
            </tr>
            <tr>
              <td>002</td>
              <td>Jane Smith</td>
              <td>Mr. Johnson</td>
              <td>2024-02-18 02:00 PM</td>
              <td>+9876543210</td>
              <td>jane.smith@email.com</td>
              <td>None</td>
            </tr>
            <tr>
              <td>003</td>
              <td>Mike Brown</td>
              <td>Dr. Adams</td>
              <td>2024-02-19 11:45 AM</td>
              <td>+1029384756</td>
              <td>mike.brown@email.com</td>
              <td>Sign Language Interpreter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PreScheduledVisitTable;
