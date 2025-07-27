import React, { useState, useEffect } from 'react';

function PurposeModal({ show, onHide, type, selectedPurpose, onAdd, onUpdate, onDelete }) {
  const [purposeInput, setPurposeInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setPurposeInput(type === 'edit' ? selectedPurpose : "");
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

    if (type === 'add') {
      onAdd(purposeInput.trim());
    } else if (type === 'edit') {
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
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onHide} // Close modal when clicking outside
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{type === 'add' ? 'Add New Purpose Option' : 'Edit Purpose Option'}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="purposeInput" className="form-label">New Option</label>
                <input
                  type="text"
                  className="form-control"
                  id="purposeInput"
                  value={purposeInput}
                  onChange={(e) => setPurposeInput(e.target.value)}
                  placeholder="Input Option"
                  required
                />
                {error && <div className="text-danger mt-2">{error}</div>}
              </div>
              <div className="modal-footer d-flex justify-content-between">
                {type === 'edit' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete Option
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary ms-auto" // Push to right
                >
                  {type === 'add' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurposeModal;
