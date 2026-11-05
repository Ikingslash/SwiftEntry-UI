import React from "react";

function TabWalkInVisitors({ groupedVisits, loading }) {
  const sortedDates = Object.keys(groupedVisits || {}).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">
          Loading visitors...
        </p>
      </div>
    );
  }

  if (!groupedVisits || sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-400 text-xs font-medium mb-0">
          No visitor history found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 whitespace-nowrap">Name</th>
              <th className="py-4 px-6 whitespace-nowrap">Contact</th>
              <th className="py-4 px-6 whitespace-nowrap">Email</th>
              <th className="py-4 px-6 whitespace-nowrap">Address</th>
              <th className="py-4 px-6 whitespace-nowrap">Host Name</th>
              <th className="py-4 px-6 whitespace-nowrap">Visit Date</th>
              <th className="py-4 px-6 whitespace-nowrap">Special Req.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {sortedDates.map((date, index) => (
              <React.Fragment key={index}>
                <tr className="bg-blue-50/40">
                  <td
                    colSpan="7"
                    className="py-3 px-6 text-[11px] font-bold text-blue-700 uppercase tracking-wider"
                  >
                    {date === new Date().toISOString().split("T")[0]
                      ? "Today"
                      : date}
                  </td>
                </tr>
                {groupedVisits[date].map((visit, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {visit.visitor?.name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor?.contact_number || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor?.email || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor?.address || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.host_name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {visit.visit_time || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {visit.visitor?.special_requirements || "None"}
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

export default TabWalkInVisitors;
