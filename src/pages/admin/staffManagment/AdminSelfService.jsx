import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';
import AdminTopHeader from "../include/AdminTopHeader";

function AdminSelfService() {
  const [, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selfServiceUsers, setSelfServiceUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    name: "",
    email: "",
    role: "self_service",
  });

  useEffect(() => {
    fetchSelfServiceUsers();
  }, []);
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    fetchSelfServiceUsers();
  };

  const fetchSelfServiceUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/self-service-users");
      setSelfServiceUsers(response.data.users || []);
    } catch {
      toast.error("Failed to load self-service users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewUserFormData({
      name: "",
      email: "",
      role: "self_service",
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUserFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const showValidationErrors = (error) => {
    if (error.response && error.response.status === 422) {
      let validationErrors = error.response.data.errors || error.response.data;

      if (typeof validationErrors === "string") {
        toast.error(validationErrors);
        return;
      }

      Object.values(validationErrors).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(msg));
        } else if (typeof messages === "string") {
          toast.error(messages);
        }
      });
    } else {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      await api.post("/admin/self-service-users", newUserFormData);
      handleAddModalClose();
      triggerRefresh();
      toast.success("Self-service user created successfully!");
    } catch (error) {
      showValidationErrors(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/self-service-users/${userId}`);
        triggerRefresh();
        toast.success("User deleted successfully");
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <AdminTopHeader />

      {/* Header Container aligned to max-w-[1140px] */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Manage Self-Service Users
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            View and manage self-service account profiles.
          </p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg mr-2"></i> Add New User
        </button>
      </div>

      {/* Main Content Container matching exact width */}
      <div className="max-w-[1140px] mx-auto px-4 mt-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading self-service users...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-6 overflow-x-auto">
            <div className="min-w-[1000px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-4 px-6 rounded-tl-3xl">ID</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Position</th>
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-6">Employee ID</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-center rounded-tr-3xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {selfServiceUsers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-slate-400 py-12 text-xs">
                        No self-service users found
                      </td>
                    </tr>
                  ) : (
                    selfServiceUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-500 text-xs font-medium">{user.id}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{user.name}</td>
                        <td className="py-4 px-6 text-slate-600">{user.email}</td>
                        <td className="py-4 px-6 text-slate-600">{user.position || "N/A"}</td>
                        <td className="py-4 px-6 text-slate-600">{user.company_name || "N/A"}</td>
                        <td className="py-4 px-6 text-slate-600">{user.employee_id || "N/A"}</td>
                        <td className="py-4 px-6 text-slate-600">{user.department || "N/A"}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${user.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {user.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <i className="bi bi-trash text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Slide-over Modal */}
      {showAddModal && (
        <div onClick={handleAddModalClose} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create Self-Service User</h3>
              <button onClick={handleAddModalClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="name"
                    value={newUserFormData.name}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="email"
                    value={newUserFormData.email}
                    onChange={handleFormChange}
                    placeholder="Enter email address"
                    required
                  />
                  <span className="block text-slate-400 text-[10px] mt-1">An invitation email will be sent to this address</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                    value="Self-Service User"
                    readOnly
                  />
                  <span className="block text-slate-400 text-[10px] mt-1">Set automatically for this page.</span>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    onClick={handleAddModalClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSelfService;