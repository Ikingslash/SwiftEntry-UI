import React, { useState, useEffect } from "react";

const PurposeModal = ({ type, show, onHide, selectedPurpose, onAdd, onUpdate, onDelete }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (type === "edit") setValue(selectedPurpose);
    else setValue("");
  }, [type, selectedPurpose]);

  const handleSubmit = () => {
    if (type === "add") onAdd(value);
    else onUpdate(value);
    onHide();
  };

  if (!show) return null; // Conditionally render modal

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          
          <div className="modal-header">
            <h5 className="modal-title">
              {type === "add" ? "Add New Purpose Option" : "Edit Purpose Option"}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            <input
              type="text"
              className="form-control"
              placeholder="Input Option"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            {type === "edit" && (
              <button className="btn btn-danger" onClick={() => { onDelete(); onHide(); }}>
                Delete Option
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSubmit}>
              {type === "add" ? "Add" : "Update"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PurposeModal;
