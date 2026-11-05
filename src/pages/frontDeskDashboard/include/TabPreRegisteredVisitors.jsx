import React from "react";

const Pagination = ({ pagination, handlePageChange }) => {
  if (!pagination || !pagination.last_page) return null;
  const { current_page, last_page } = pagination;

  return (
    <div className="flex items-center justify-between px-2 my-6">
      <span className="text-slate-500 text-xs font-medium">
        Page {current_page} of {last_page}
      </span>
      <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs gap-1">
        <button
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-left text-xs"></i>
        </button>
        <button
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-35 rounded-xl transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

function TabPreRegisteredVisitors({
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
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center text-slate-500 text-xs font-medium">
        Loading visitors...
      </div>
    );
  }

  if (!groupedVisits || sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-12 text-center text-slate-400 text-xs">
        No visitor history found.
      </div>
    );
  }

  return (
    <div>
      {/* Self-contained Table Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Contact Information</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Host Name</th>
                <th className="py-4 px-6">Special Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedDates.map((date, index) => {
                const displayDate = date === new Date().toISOString().split("T")[0] ? "Today" : date;
                const visits = groupedVisits[date];

                return visits.map((visit, idx) => (
                  <tr key={`${index}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {visit.visitor_name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {visit.visitor_contact_number || "N/A"}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {displayDate}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.visitor_email || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600 truncate max-w-[150px]">
                      {visit.visitor_address || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {visit.host_name || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {visit.special_requirements || "None"}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completely Independent Pagination Outside Table Card */}
      {pagination && pagination.last_page > 1 && (
        <Pagination
          pagination={pagination}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default TabPreRegisteredVisitors;