import { useState, useEffect } from "react";
import api from "../../context/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import AdminTopHeader from "./include/AdminTopHeader";

export default function AdminPriorityAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const fetchAlerts = async (pageToFetch = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/admin/alerts/priority", {
        params: { per_page: perPage, page: pageToFetch },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.alerts || []);
      setPagination(res.data.pagination || {});
    } catch (e) {
      console.error("Failed to fetch alerts:", e);
      toast.error("Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  const handlePage = (p) => {
    if (p < 1 || (pagination.last_page && p > pagination.last_page)) return;
    setPage(p);
  };

  const currentPage = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12 font-sans">
      <AdminTopHeader />

      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Priority Alerts
        </p>
        <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
          Visitors that need immediate attention.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-500 text-xs font-medium">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-xs font-medium mb-0">
              No priority alerts right now.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden divide-y divide-slate-100">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm mb-0 truncate">
                      {a.visitor_name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 mb-0 break-words">
                      {a.purpose} — {a.host_name}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1 mb-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {new Date(a.check_in).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <span className="text-slate-500 text-xs font-medium shrink-0">
                Page {currentPage} of {lastPage}
              </span>
              <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  type="button"
                  onClick={() => handlePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: lastPage }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePage(i + 1)}
                    className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border shrink-0 ${
                      currentPage === i + 1
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePage(currentPage + 1)}
                  disabled={currentPage >= lastPage}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
