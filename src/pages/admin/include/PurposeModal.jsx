import { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";

function PurposeModal({ show, onHide, type, selectedPurpose, onAdd, onUpdate, onDelete }) {
  const [purposeInput, setPurposeInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setPurposeInput(type === "edit" ? selectedPurpose : "");
      setError(""); // Clear errors on show
    }
  }, [show, type, selectedPurpose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!purposeInput.trim()) {
      setError("Purpose cannot be empty.");
      return;
    }

    if (type === "add") {
      onAdd(purposeInput.trim());
    } else if (type === "edit") {
      onUpdate(purposeInput.trim());
    }
    // onHide() will be called by the parent after successful API call
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this purpose?")) {
      onDelete();
      // onHide() will be called by the parent after successful API call
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onHide}
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3">
          <span className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {type === "add" ? "Add New Purpose Option" : "Edit Purpose Option"}
          </h3>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
            onClick={onHide}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
          <div>
            <label
              htmlFor="purposeInput"
              className="block text-xs font-semibold text-slate-700 mb-2"
            >
              New Option
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              id="purposeInput"
              value={purposeInput}
              onChange={(e) => setPurposeInput(e.target.value)}
              placeholder="Input option"
              required
            />
            {error && (
              <p className="text-rose-600 text-[11px] mt-2 mb-0">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {type === "edit" ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border-0 cursor-pointer transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-0 cursor-pointer transition-colors"
            >
              {type === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurposeModal;
