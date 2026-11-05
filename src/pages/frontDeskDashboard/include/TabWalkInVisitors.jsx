import React from "react";

const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || !pagination.last_page) return null;
  const { current_page, last_page } = pagination;

  return (
    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
      <button
        type="button"
        className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        onClick={() => handlePageChange(current_page - 1)}
        disabled={current_page === 1}
      >
        <i className="bi bi-chevron-left text-xs"></i> Previous
      </button>
      <span className="text-slate-500 font-semibold">
        Page {current_page} of {last_page}
      </span>
      <button
        type="button"
        className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        onClick={() => handlePageChange(current_page + 1)}
        disabled={current_page === last_page}
      >
        Next <i className="bi bi-chevron-right text-xs"></i>
      </button>
    </div>
  );
};

function TabWalkInVisitors({
  groupedVisits,
  loading,
  pagination,
  handlePageChange,
}) {
  const sortedDates = Object.keys(groupedVisits || {}).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">Loading visitors...</p>
      </div>
    );
  }

  if (!groupedVisits || sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-400 text-xs font-medium mb-0">No visitor history found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Contact Information</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Host Name</th>
                <th className="py-4 px-6">Visit Date</th>
                <th className="py-4 px-6">Special Req.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {sortedDates.map((date, index) => (
                <React.Fragment key={index}>
                  <tr className="bg-slate-50/40 border-b border-slate-100">
                    <td colSpan="7" className="py-3 px-6 text-xs font-bold text-slate-700">
                      {date === new Date().toISOString().split("T")[0] ? "Today" : date}
                    </td>
                  </tr>
                  {groupedVisits[date].map((visit, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {visit.visitor_name || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {visit.visitor_contact_number || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {visit.visitor_email || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {visit.visitor_address || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">{visit.host_name || "N/A"}</td>
                      <td className="py-4 px-6 text-slate-500">{visit.visit_date || "N/A"}</td>
                      <td className="py-4 px-6 text-slate-500">
                        {visit.special_requirements || "None"}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.last_page > 1 && (
          <Pagination pagination={pagination} handlePageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}

export default TabWalkInVisitors;
