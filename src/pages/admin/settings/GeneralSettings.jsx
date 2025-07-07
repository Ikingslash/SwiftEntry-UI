import React, { useState } from "react";
import PurposeModal from "../include/PurposeModal";
import CardOption from "../include/CardOption";
function GeneralSettings() {
  const [primaryColor, setPrimaryColor] = useState("");
  const [timezone, setTimezone] = useState("WAT");
  const [purposes, setPurposes] = useState([
    "Recruitment",
    "Business Meeting",
    "Repairs & Maintenance",
    "Personal",
    "Other",
  ]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [modalType, setModalType] = useState(""); // "add" or "edit"
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("blue");

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    // You can also save it to backend or context here
  };

  const handleAddPurpose = (newPurpose) => {
    setPurposes([...purposes, newPurpose]);
  };

  const handleUpdatePurpose = (updatedPurpose) => {
    setPurposes(
      purposes.map((p) => (p === selectedPurpose ? updatedPurpose : p))
    );
  };

  const handleDeletePurpose = () => {
    setPurposes(purposes.filter((p) => p !== selectedPurpose));
  };

  return (
    <div>
      <div className="row mb-5">
        {/* Appearance */}
        <div className="col-md-4">
          <div className=" p-3">
            <h5 className="mb-3">Appearance</h5>
            <p>
              {" "}
              <small>
                Customize the Interface Colour themes to reflect your
                organization’s identity. Maintain consistency across all
                dashboards and Platforms.
              </small>
            </p>
          </div>
        </div>
        <div className="col-md-8">
          <div className="row d-flex my-3">
            <CardOption
              title="Default"
              themeColor="blue"
              selected={selectedTheme === "blue"}
              onClick={() => handleThemeSelect("blue")}
            />
            <CardOption
              title="Classic"
              themeColor="orange"
              selected={selectedTheme === "orange"}
              onClick={() => handleThemeSelect("orange")}
            />
            <CardOption
              title="Royal"
              themeColor="purple"
              selected={selectedTheme === "purple"}
              onClick={() => handleThemeSelect("purple")}
            />
          </div>

          <div className="card shadow-sm p-4">
            <h6 className="mb-3 fw-semibold">Customize Primary Color</h6>

            <div className="row align-items-center">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Color Code (e.g. #007bff)"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>

              <div className="col-md-3 mb-2">
                <button className="btn btn-primary w-100">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Timezone */}
      <div className="row my-3">
        <div className="col-md-6">
          <div className=" p-3">
            <h5 className="mb-3">Time Zone Management</h5>
            <p>
              {" "}
              <small>
                Set and manage time zones to ensure accurate timestamps for
                visitor check-ins, reports, and notifications.
              </small>
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h6 className="mb-3 fw-semibold">Time Zone</h6>

            <div className="row align-items-center">
              <div className="col-md-12 mb-2">
                <select
                  className="form-select w-100"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="CAT">Central Africa Time (CAT)</option>
                  <option value="WAT">West Africa Time (WAT)</option>
                  <option value="EAT">East Africa Time (EAT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Purpose of Visit */}
      <div className="row my-3">
        <div className="col-md-6">
          <div className=" p-3">
            <h5 className="mb-3">Purpose of Visit</h5>
            <p>
              {" "}
              <small>Edit Visit Purpose Details</small>
            </p>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="d-flex justify-content-between card-header bg-white align-items-center">
              <strong>Edit Visit Purpose Details</strong>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalType("add");
                  setShowModal(true);
                }}
              >
                Add New
              </button>
            </div>
            <ul className="card-body mt-3">
              {purposes.map((p, i) => (
                <li
                  key={i}
                  className=" d-flex justify-content-between align-items-center"
                >
                  {p}
                  <button
                    className="btn btn-link"
                    onClick={() => {
                      setSelectedPurpose(p);
                      setModalType("edit");
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Date & Time Format */}
      <div className="row my-3">
        <div className="col-md-6">
          <div className=" p-3">
            <h5 className="mb-3">Date & Time Format</h5>
            <p>
              {" "}
              <small>
                Choose preferred formats for dates and times to align with
                organizational requirements.
              </small>
            </p>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="row p-4">
              <div className="col-md-6">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dateFormat"
                    id="mdy"
                  />
                  <label className="form-check-label" htmlFor="mdy">
                    MM/DD/YYYY
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dateFormat"
                    id="dmy"
                  />
                  <label className="form-check-label" htmlFor="dmy">
                    DD/MM/YYYY
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Language Preference Placeholder */}
   
      <div className="row my-3">
        <div className="col-md-6">
          <div className=" p-3">
            <h5 className="mb-3">Language Preference</h5>
            <p>
              {" "}
              <small>
              Choose preferred formats for dates and times to align with organizational requirements.
              </small>
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h6 className="mb-3 fw-semibold">Choose Language</h6>

            <div className="row align-items-center">
              <div className="col-md-12 mb-2">
                <select
                  className="form-select w-100"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="GMT">English</option>
                  <option value="CAT">French</option>
                  <option value="WAT">Hindu</option>
                  <option value="EAT">Arabic</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div> 

      {/* Modal */}
      <PurposeModal
        type={modalType}
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedPurpose={selectedPurpose}
        onAdd={handleAddPurpose}
        onUpdate={handleUpdatePurpose}
        onDelete={handleDeletePurpose}
      />
    </div>
  );
}

export default GeneralSettings;
