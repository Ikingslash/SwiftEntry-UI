import { useState } from "react";
import api from "../../../context/api";
import { toast } from "react-toastify";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

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
        user_ids: selectedUsers.map((user) => user.id),
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={isDeleting ? undefined : onClose}
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Confirm Bulk Delete
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent disabled:opacity-40"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-4">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-3.5 py-3 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Warning:</strong> This action cannot be
              undone.
            </span>
          </div>

          <p className="text-slate-600 text-xs mb-0">
            You are about to permanently delete the following{" "}
            <strong className="text-slate-900">{selectedUsers.length}</strong>{" "}
            user(s):
          </p>

          <div className="max-h-[220px] sm:max-h-[300px] overflow-y-auto bg-slate-50 border border-slate-100 rounded-xl p-3 divide-y divide-slate-200/70">
            {selectedUsers.map((user, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <p className="mb-0 text-xs font-bold text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="mb-0 text-[11px] text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-3 mb-0">
            <strong className="font-bold">Important:</strong> All data associated
            with these users will be deleted, including their visits and activity
            logs.
          </p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border-0 cursor-pointer transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold border-0 cursor-pointer transition-colors disabled:opacity-50"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
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
