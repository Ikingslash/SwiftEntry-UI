import { useState } from "react";
import VisitorLayout from "../layout/VisitorLayout";
import api from "../context/api";
import { toast } from "react-toastify";
import VisitorVisitCard from "./visitorDashboard/include/VisitorVisitCard";
import {
  Search,
  RefreshCw,
  XCircle,
  Ticket,
  Loader2,
  Info,
} from "lucide-react";

function VisitorSelfServiceDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter your visit code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/self-service/visits/search", {
        params: { query: searchQuery },
      });

      if (response.data && response.data.visits) {
        setVisits(response.data.visits);
        if (response.data.visits.length === 0) {
          toast.info("No visits found");
        }
      }
      setHasSearched(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to search visits");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setVisits([]);
    setHasSearched(false);
  };

  const handleRefresh = () => {
    if (searchQuery.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  return (
    <VisitorLayout>
      {/* Page Header */}
      <div className="text-center mb-5 sm:mb-7">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Search Your Visit
        </h1>
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1 mb-0">
          Enter your visit code to view details and check in or out.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 sm:py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your visit code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 px-6 py-3.5 sm:py-3 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer border-0 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900 mb-0">
              Results ({visits.length} visit{visits.length !== 1 ? "s" : ""})
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {visits.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-8 sm:p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                No visits found
              </h3>
              <p className="text-[11px] text-slate-400 mb-0">
                Please try a different visit code.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visits.map((visit) => (
                <VisitorVisitCard
                  key={visit.id}
                  visit={visit}
                  onActionComplete={handleClearSearch}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <div className="max-w-2xl mx-auto mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">
            Use the search field above to find your visit
          </h3>
          <p className="text-[11px] text-slate-400 mb-0 leading-relaxed">
            Enter your visit code to see your visit details and check in/out.
          </p>
        </div>
      )}
    </VisitorLayout>
  );
}

export default VisitorSelfServiceDashboard;
