import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import AdminVisitorsTab from "./AdminVisitorsTab";
import AdminVisit from "./AdminVisit";
import AdminTopHeader from "../include/AdminTopHeader";
import api from "../../../context/api";
import { useTenant } from "../../../context/TenantContext";

function AdminVisitors({ initialTab = "visitors" }) {
  const navigate = useNavigate();
  const { isTenantScope } = useTenant();
  const base = isTenantScope ? "/tenant-dashboard" : "/admin-dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [showModal, setShowModal] = useState(false);
  const [newVisitorData, setNewVisitorData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
    visitor_type: "Individual",
  });
  const [refreshVisitorsKey, setRefreshVisitorsKey] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVisitorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/visitors", newVisitorData);
      console.log("Visitor created:", response.data);
      setShowModal(false);
      setNewVisitorData({
        name: "",
        contact_number: "",
        email: "",
        address: "",
        visitor_type: "Individual",
      });
      setRefreshVisitorsKey((prevKey) => prevKey + 1);
      alert("Visitor added successfully!");
    } catch (error) {
      console.error("Error adding visitor:", error.response?.data || error.message);
      alert("Failed to add visitor: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <AdminTopHeader />

      {/* Header Container aligned to max-w-[1140px] matching Pre-Register Guest */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Manage Visitors
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            View and manage all registered visitors and active visits.
          </p>
        </div>

        {/* Modern Fully Rounded Pill Switcher */}
        <div className="inline-flex self-start sm:self-auto p-1 bg-white border border-slate-200/85 rounded-full shadow-sm">
          <button
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border-0 cursor-pointer ${activeTab === "visitors"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            onClick={() => {
              setActiveTab("visitors");
              navigate(`${base}/visitors`);
            }}
          >
            Visitors Log
          </button>
          <button
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border-0 cursor-pointer ${activeTab === "visit"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            onClick={() => {
              setActiveTab("visit");
              navigate(`${base}/visits`);
            }}
          >
            Visitor Schedule
          </button>
        </div>
      </div>

      {/* Tab Content Container matching exact width & alignment */}
      <div className="max-w-[1140px] mx-auto px-4 mt-3">
        {activeTab === "visitors" && <AdminVisitorsTab refreshKey={refreshVisitorsKey} />}
        {activeTab === "visit" && <AdminVisit />}
      </div>

      {/* Modal for Adding a Visitor */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-3">
              <span className="w-10 h-1.5 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-0">
                  Create Visitor Information
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-0">
                  Add a new visitor record to the directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddVisitorSubmit}
              className="px-5 sm:px-6 py-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Visitor&apos;s Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  name="name"
                  value={newVisitorData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  name="email"
                  value={newVisitorData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  name="contact_number"
                  value={newVisitorData.contact_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  name="address"
                  value={newVisitorData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl px-4 py-3 border-0 cursor-pointer transition-colors"
              >
                Create Visitor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVisitors;