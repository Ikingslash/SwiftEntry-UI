import { useState } from "react";
import ManageStaffTable from "./ManageFrontdeskTable";
import BulkUploadModal from "../include/BulkUploadModal";
import BulkDeleteConfirmModal from "../include/BulkDeleteConfirmModal";
import api from "../../../context/api";
import { toast } from 'react-toastify';
import AdminTopHeader from "../include/AdminTopHeader";

function AdminFrontdesk() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaffFormData, setNewStaffFormData] = useState({
    name: "",
    email: "",
    role: "front_desk",
  });
  const [formErrors, setFormErrors] = useState({});

  const triggerRefresh = () => setRefreshKey((prevKey) => prevKey + 1);

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewStaffFormData({
      name: "",
      email: "",
      role: "front_desk",
    });
    setFormErrors({});
  };

  const handleNewStaffFormChange = (e) => {
    const { name, value } = e.target;
    setNewStaffFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleAddNewStaff = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(newStaffFormData).forEach(([key, value]) => {
      if (key !== 'password' && value !== null) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post("admin/frontdesk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Frontdesk added:", response.data);
      handleAddModalClose();
      triggerRefresh();
      toast.success("Frontdesk added successfully! An invitation email has been sent to the frontdesk member.");
    } catch (error) {
      showValidationErrors(error);
      console.log("Validation errors:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectionChange = (users) => {
    setSelectedUsers(users);
  };

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to delete");
      return;
    }
    setShowBulkDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <AdminTopHeader />

      {/* Header Container aligned to max-w-[1140px] */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Manage Frontdesk
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            View, invite, and manage system frontdesk accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleBulkDeleteClick}
            disabled={selectedUsers.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <i className="bi bi-trash mr-2"></i>
            Bulk Delete {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </button>
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <i className="bi bi-cloud-arrow-up mr-2"></i>
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <i className="bi bi-plus-lg mr-2"></i> Add New Frontdesk
          </button>
        </div>
      </div>

      {/* Staff Table Container matching exact width */}
      <div className="max-w-[1140px] mx-auto px-4 mt-3">
        <ManageStaffTable
          refreshKey={refreshKey}
          triggerRefresh={triggerRefresh}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* Add Staff Slide-over Modal */}
      {showAddModal && (
        <div
          onClick={handleAddModalClose}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Frontdesk</h3>
              <button
                onClick={handleAddModalClose}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleAddNewStaff} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newStaffFormData.name}
                    onChange={handleNewStaffFormChange}
                    placeholder="Enter full name"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.name && (
                    <div className="text-rose-600 text-[10px] mt-1">{formErrors.name[0]}</div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newStaffFormData.email}
                    onChange={handleNewStaffFormChange}
                    placeholder="Enter email address"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="block text-slate-400 text-[10px] mt-1">An invitation email will be sent to this address</span>
                  {formErrors.email && (
                    <div className="text-rose-600 text-[10px] mt-1">{formErrors.email[0]}</div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    value="Frontdesk"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                  />
                  <span className="block text-slate-400 text-[10px] mt-1">Set automatically for this page.</span>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Sending Invitation...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        userType="frontdesk"
        onSuccess={() => {
          setShowBulkUploadModal(false);
          triggerRefresh();
        }}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        selectedUsers={selectedUsers}
        userType="frontdesk"
        onSuccess={() => {
          setShowBulkDeleteModal(false);
          setSelectedUsers([]);
          triggerRefresh();
        }}
      />
    </div>
  );
}

export default AdminFrontdesk;