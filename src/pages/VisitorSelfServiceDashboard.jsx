import { useState, useEffect } from "react";
import VisitorLayout from "../layout/VisitorLayout";
import api from "../context/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VisitorVisitCard from "./visitorDashboard/include/VisitorVisitCard";

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
      toast.error(
        error.response?.data?.error || "Failed to search visits"
      );
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
      handleSearch({ preventDefault: () => { } });
    }
  };

  return (
    <VisitorLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-md-12 text-center">
            <h2 className="fw-bold" style={{ color: "#053561" }}>
              Search Your Visit
            </h2>
            <p className="text-muted">
              Search for your visit using your visit code
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <form onSubmit={handleSearch}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your visit code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    borderColor: "#053561",
                    borderWidth: "2px",
                  }}
                />
                <button
                  className="btn"
                  type="submit"
                  style={{
                    backgroundColor: "#053561",
                    color: "white",
                    borderColor: "#053561",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">
                  Results ({visits.length} visit{visits.length !== 1 ? "s" : ""})
                </h5>
                <div className="gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleRefresh}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={handleClearSearch}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Clear
                  </button>
                </div>
              </div>

              {visits.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No visits found. Please try a different search term.
                </div>
              ) : (
                <div className="row">
                  {visits.map((visit) => (
                    <div key={visit.id} className="col-md-6 mb-4">
                      <VisitorVisitCard
                        visit={visit}
                        onActionComplete={handleClearSearch}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="row">
            <div className="col-md-8 mx-auto text-center mt-5">
              <i
                className="bi bi-search"
                style={{ fontSize: "4rem", color: "#d3d3d3" }}
              ></i>
              <h5 className="mt-3 text-muted">
                Use the search field above to find your visit
              </h5>
              <p className="text-muted">
                Enter your visit code to see your visit details and
                check in/check out
              </p>
            </div>
          </div>
        )}
      </div>
    </VisitorLayout>
  );
}

export default VisitorSelfServiceDashboard;
