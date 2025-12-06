import { useState, useEffect } from "react";
import api from "../../context/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import NavBar from "./include/NavBar";

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
    <>
      <NavBar />
      <header
        className="text-white text-center d-flex align-items-center px-4"
        style={{
          backgroundColor: "#053561",
          minHeight: "300px",
          marginTop: "56px",
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
          borderBottomLeftRadius: "3%",
          borderBottomRightRadius: "3%",
        }}
      >
        <div className="container">
          <div
            className="text-white p-4 shadow-sm rounded"
            style={{
              backgroundColor: "#053561",
              minHeight: "160px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fw-bold mb-0">Latest Visitors</h3>
              {/* <i
                className="bi bi-plus-circle fs-1 text-white-50 p-2"
                style={{ cursor: "pointer", transition: "0.3s" }}
                onMouseOver={(e) => (e.target.style.color = "#0d6efd")}
                onMouseOut={(e) => (e.target.style.color = "white")}
              ></i> */}
            </div>

            <div
              className="w-100 mt-3"
              style={{
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
              }}
            ></div>
          </div>
        </div>
      </header>

      <div className="container my-5">
        {loading ? (
          <p>Loading...</p>
        ) : visitors.length === 0 ? (
          <p>No visitors yet.</p>
        ) : (
          <>
            <div className="list-group">
              {visitors.map((v) => (
                <div
                  key={v.id}
                  className="list-group-item d-flex align-items-center"
                >
                  {/* <img
                    src={v.photo || "./images/user1.png"}
                    alt="visitor"
                    width="60"
                    height="60"
                    style={{ objectFit: "cover" }}
                  /> */}
                  <div className="ms-3">
                    <div className="fw-bold">{v.name}</div>
                    <div className="text-muted">
                      {v.email || v.contact_number}
                    </div>
                    <div className="small text-muted">
                      {new Date(v.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <nav className="my-3">
              <ul className="pagination">
                <li
                  className={`page-item ${
                    pagination.current_page <= 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePage(pagination.current_page - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: pagination.last_page || 1 }).map(
                  (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        pagination.current_page === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${
                    pagination.current_page >= (pagination.last_page || 1)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePage(pagination.current_page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    </>
  );
}
