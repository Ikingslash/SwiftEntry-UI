import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";

function BulkDeleteConfirmModal({ isOpen, onClose, selectedUsers, userType, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await api.post("/admin/users/bulk-delete", {
        user_ids: selectedUsers.map(user => user.id),
        user_type: userType,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
        if (onSuccess) {
          setTimeout(onSuccess, 1000);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Delete failed";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Confirm Bulk Delete
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isDeleting}
            ></button>
          </div>

          <div className="modal-body">
            <div className="alert alert-warning mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              <strong>Warning:</strong> This action cannot be undone.
            </div>

            <p className="mb-3">
              You are about to permanently delete the following <strong>{selectedUsers.length}</strong> user(s):
            </p>

            <div style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "4px" }}>
              {selectedUsers.map((user, idx) => (
                <div key={idx} className="mb-2 pb-2 border-bottom small">
                  <p className="mb-1">
                    <strong>{user.name}</strong>
                  </p>
                  <p className="mb-0 text-muted">{user.email}</p>
                </div>
              ))}
            </div>

            <div className="alert alert-danger mt-3 mb-0">
              <small>
                <strong>Important:</strong> All data associated with these users will be deleted, including their visits and activity logs.
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Delete {selectedUsers.length} User(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkDeleteConfirmModal;
