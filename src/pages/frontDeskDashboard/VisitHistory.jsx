import { useEffect, useState } from "react";
import NavBar from "./include/NavBar";
import TabPreRegisteredVisitors from "./include/TabPreRegisteredVisitors";
import { IoCheckmark } from "react-icons/io5";
import api from "../../context/api";
import { toast } from "react-toastify";

// Helper function to group visits by date
const groupVisitsByDate = (visits) => {
  if (!Array.isArray(visits)) {
    return {};
  }
  return visits.reduce((acc, visit) => {
    const date = visit.visit_date; // Assuming your backend returns 'visit_date'
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(visit);
    return acc;
  }, {});
};

function VisitSecurityHistory() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [groupedVisits, setGroupedVisits] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState("");
  const [purpose, setPurpose] = useState("all");
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [visitPurposes, setVisitPurposes] = useState([]);

  useEffect(() => {
    fetchHistory();
    api
      .get("/front-desk/guests/settings/visit-purposes")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setVisitPurposes(response.data);
        } else {
          console.error(
            "API response for purposes is not an array:",
            response.data
          );
          toast.error(
            "API response for purposes is not an array: Please check the backend response."
          );
        }
      })
      .catch((error) => {
        console.error("Failed to fetch visit purposes:", error);
        toast.error(
          "Failed to fetch visit purposes: " +
            (error.response?.data?.message || "Server error.")
        );
      });
  }, [activeFilter, month, purpose, currentPage]);

const fetchHistory = async () => {
  setLoading(true);
  try {
    const monthParam = month
      ? new Date(`${month} 1, 2025`).getMonth() + 1
      : null;

    const response = await api.get("/front-desk/history/visits", {
      params: {
        visitor_type: activeFilter,
        month: monthParam,
        purpose: purpose !== "all" ? purpose : null,
        per_page: perPage,
        page: currentPage,
      },
    });

    if (!response?.data || !response.data.visits) {
      throw new Error("Invalid response structure: 'visits' key not found.");
    }

    const groupedData = groupVisitsByDate(response.data.visits);
    setGroupedVisits(groupedData);
    setPagination(response.data.pagination || {});
    // toast.success("Visit history fetched successfully.");
  } catch (err) {
      console.error("Error fetching history:", err);
      if (err.response && err.response.status === 422) {
          toast.error("Validation error: " + JSON.stringify(err.response.data));
      } else {
          toast.error("Failed to fetch visit history. Please try again.");
      }
  } finally {
    setLoading(false);
  }
};

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // useEffect will handle the new fetch
  };

  return (
    <div>
      <NavBar />
      <header
        id="home"
        className="text-white text-center position-relative d-flex align-items-center justify-content-between px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "270px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white shadow-sm"
            style={{ backgroundColor: "#053561", minHeight: "180px" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bod mb-0">Visits</h3>
              
            </div>

            <div className="d-flex align-items-center mt-2">
              <p
                className="badge text-white"
                style={{
                  backgroundColor: "rgba(25, 88, 148, 0.8)",
                }}
              >
                Syndani Group{" "}
                <span
                  className="badge text-light p-1"
                  style={{
                    backgroundColor: "rgba(13, 46, 78, 0.8)",
                  }}
                >
                  Company
                </span>
              </p>
              <div
                className="flex-grow-1 ms-3 mb-3"
                style={{
                  height: "2px",
                  backgroundColor: "rgba(168, 172, 176, 0.8)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mt-5">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex flex-column w-100 position-relative">
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "1px",
                backgroundColor: "rgb(200, 200, 200)",
              }}
            ></div>
          </div>

          <div className="d-flex gap-2">
            <select
              className="form-select me-3"
              style={{ minWidth: "150px", flex: "1" }}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="form-select me-3"
              style={{ minWidth: "150px", flex: "1" }}
              onChange={(e) => setPurpose(e.target.value)}
              value={purpose}
            >
              <option value="all">All Categories</option>
              {visitPurposes.map((purpose, index) => (
                <option key={index} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>

            {[
              { label: "All", value: "all", width: "60px" },
              { label: "Individual", value: "individual", width: "180px" },
              { label: "Group", value: "group", width: "160px" },
            ].map((item) => (
              <a
                key={item.value}
                onClick={() => setActiveFilter(item.value)}
                className={`bg-white d-flex align-items-center justify-content-center text-dark text-decoration-none border ${
                  activeFilter === item.value ? "border-primary" : "border"
                }`}
                style={{
                  minWidth: item.width,
                  borderRadius: "7px",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <small>{item.label}</small>
                {activeFilter === item.value && (
                  <IoCheckmark className="fs-5 text-primary" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <TabPreRegisteredVisitors
          groupedVisits={groupedVisits}
          pagination={pagination}
          loading={loading}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default VisitSecurityHistory;
