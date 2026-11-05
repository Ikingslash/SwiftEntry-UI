import { useState, useEffect } from "react";
import api from "../../context/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import AdminTopHeader from "./include/AdminTopHeader";
import UserAvatar from "../../components/UserAvatar";

export default function AdminLatestUpdates() {
  const { token } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisitors(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const fetchVisitors = async (pageToFetch = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/admin/updates/latest", {
        params: { per_page: perPage, page: pageToFetch },
        headers: { Authorization: `Bearer ${token}` },
      });
      setVisitors(res.data.visitors || []);
      setPagination(res.data.pagination || {});
    } catch (e) {
      console.error("Failed to fetch visitors:", e);
      toast.error("Failed to load latest updates.");
    } finally {
      setLoading(false);
    }
  };

  const handlePage = (p) => {
    if (p < 1 || (pagination.last_page && p > pagination.last_page)) return;
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <AdminTopHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <section className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-0">
              Visitors Update Log
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-black text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-4">Icon</th>
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center text-black py-6">
                      Loading updates...
                    </td>
                  </tr>
                ) : visitors.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-black py-6">
                      No recent visitors
                    </td>
                  </tr>
                ) : (
                  visitors.map((v, idx) => {
                    const dateObj = new Date(v.created_at);
                    const dateStr = dateObj.toLocaleDateString();
                    const timeStr = dateObj.toLocaleTimeString();
                    return (
                      <tr
                        key={v.id ?? idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <UserAvatar
                              image={v.photo}
                              firstName={v.name || "Visitor"}
                              size={34}
                              className="rounded-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-black">
                          {v.name}
                        </td>
                        <td className="py-3 px-4 text-black font-medium">
                          {dateStr}
                        </td>
                        <td className="py-3 px-4 text-black font-medium">
                          {timeStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.last_page && pagination.last_page > 1 && (
            <nav className="mt-6 flex justify-center">
              <ul className="flex items-center gap-1 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <li>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${pagination.current_page <= 1
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-50"
                      }`}
                    onClick={() => handlePage(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: pagination.last_page || 1 }).map(
                  (_, i) => (
                    <li key={i}>
                      <button
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${pagination.current_page === i + 1
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                          }`}
                        onClick={() => handlePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  )
                )}
                <li>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${pagination.current_page >= (pagination.last_page || 1)
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-50"
                      }`}
                    onClick={() => handlePage(pagination.current_page + 1)}
                    disabled={
                      pagination.current_page >= (pagination.last_page || 1)
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
