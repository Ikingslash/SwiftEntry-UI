import React, { useState, useEffect } from "react";
import PurposeModal from "../include/PurposeModal";
import CardOption from "../include/CardOption";  
import api from "../../../context/api"; 

function GeneralSettings() {
  const [settings, setSettings] = useState({
    primary_color: "",
    timezone: "WAT", // Default value
    visit_purposes: [],
    date_format: "MM/DD/YYYY", // Default value
    time_format: "12-hour", // Assuming you'll add this to backend
    language_preference: "English", // Default value
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [modalType, setModalType] = useState(""); // "add" or "edit"
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("blue"); // This is a frontend UI state

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/settings");
      const fetchedSettings = response.data.general_settings; // Access the general_settings object
      setSettings({
        primary_color: fetchedSettings.primary_color || "",
        timezone: fetchedSettings.timezone || "WAT",
        visit_purposes: fetchedSettings.visit_purposes || [],
        date_format: fetchedSettings.date_format || "MM/DD/YYYY",
        time_format: fetchedSettings.time_format || "12-hour", // Default if not found
        language_preference: fetchedSettings.language_preference || "English",
      });
    } catch (err) {
      console.error("Error fetching settings:", err.response?.data || err.message);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      const payload = { key, value };
      const response = await api.post("/admin/settings/update", payload);
      console.log(`Setting '${key}' updated:`, response.data);
      alert(`${key.replace(/_/g, ' ')} updated successfully!`);
      fetchSettings(); // Re-fetch to ensure UI is in sync
    } catch (err) {
      console.error(`Error updating setting '${key}':`, err.response?.data || err.message);
      alert(`Failed to update ${key.replace(/_/g, ' ')}: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    // If themes correspond to primary colors in backend, update that setting
    let colorCode = '';
    switch(theme) {
      case 'blue': colorCode = '#007bff'; break; // Example default blue
      case 'orange': colorCode = '#fd7e14'; break; // Example default orange
      case 'purple': colorCode = '#6f42c1'; break; // Example default purple
      default: colorCode = '';
    }
    setSettings(prev => ({...prev, primary_color: colorCode}));
    handleUpdateSetting('primary_color', colorCode);
  };

  const handleAddPurpose = async (newPurpose) => {
    try {
      const response = await api.post("/admin/settings/add-purpose", { purpose: newPurpose });
      console.log("Purpose added:", response.data);
      alert(response.data.message);
      setShowModal(false);
      fetchSettings(); // Re-fetch to update the list
    } catch (err) {
      console.error("Error adding purpose:", err.response?.data || err.message);
      alert("Failed to add purpose: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdatePurpose = async (updatedPurpose) => {
    try {
      const response = await api.post("/admin/settings/update-purpose", {
        old_purpose: selectedPurpose,
        new_purpose: updatedPurpose,
      });
      console.log("Purpose updated:", response.data);
      alert(response.data.message);
      setShowModal(false);
      fetchSettings(); // Re-fetch to update the list
    } catch (err) {
      console.error("Error updating purpose:", err.response?.data || err.message);
      alert("Failed to update purpose: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePurpose = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedPurpose}"?`)) {
      try {
        const response = await api.post("/admin/settings/delete-purpose", { purpose: selectedPurpose });
        console.log("Purpose deleted:", response.data);
        alert(response.data.message);
        setShowModal(false);
        fetchSettings(); // Re-fetch to update the list
      } catch (err) {
        console.error("Error deleting purpose:", err.response?.data || err.message);
        alert("Failed to delete purpose: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading settings...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <div>
      <div className="row mb-5">
        {/* Appearance */}
        <div className="col-md-4">
          <div className="p-3">
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
          <div className="row d-flex my-3 g-3"> {/* Added g-3 for gap */}
            <CardOption
              title="Default"
              themeColor="#007bff" // Example blue
              selected={selectedTheme === "blue"}
              onClick={() => handleThemeSelect("blue")}
            />
            <CardOption
              title="Classic"
              themeColor="#fd7e14" // Example orange
              selected={selectedTheme === "orange"}
              onClick={() => handleThemeSelect("orange")}
            />
            <CardOption
              title="Royal"
              themeColor="#6f42c1" // Example purple
              selected={selectedTheme === "purple"}
              onClick={() => handleThemeSelect("purple")}
            />
          </div>

          <div className="card shadow-sm p-4 rounded-4 border-0"> {/* Added rounded-4 border-0 */}
            <h6 className="mb-3 fw-semibold">Customize Primary Color</h6>

            <div className="row align-items-center">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Color Code (e.g. #007bff)"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({...prev, primary_color: e.target.value}))}
                />
              </div>

              <div className="col-md-3 mb-2">
                <button
                  type="button" // Explicitly set type to button
                  className="btn btn-primary w-100"
                  onClick={() => handleUpdateSetting('primary_color', settings.primary_color)}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Timezone */}
      <div className="row my-3">
        <div className="col-md-4"> {/* Adjusted column width */}
          <div className="p-3">
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
        <div className="col-md-8"> {/* Adjusted column width */}
          <div className="card shadow-sm p-4 rounded-4 border-0"> {/* Added rounded-4 border-0 */}
            <h6 className="mb-3 fw-semibold">Time Zone</h6>

            <div className="row align-items-center">
              <div className="col-md-12 mb-2">
                <select
                  className="form-select w-100"
                  value={settings.timezone}
                  onChange={(e) => handleUpdateSetting('timezone', e.target.value)}
                >
                  <option value="GMT">Greenwich Mean Time (GMT) | UTC +0</option>
                  <option value="CAT">Central Africa Time (CAT) | UTC +2</option>
                  <option value="SAST">South Africa Standard Time (SAST) | UTC +2</option>
                  <option value="EET">Egypt Standard Time (EET) | UTC +2</option>
                  <option value="EAT">East Africa Time (EAT) | UTC +3</option>
                  <option value="WAT">West Africa Time (WAT) | UTC +1</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Purpose of Visit */}
      <div className="row my-3">
        <div className="col-md-4"> {/* Adjusted column width */}
          <div className="p-3">
            <h5 className="mb-3">Purpose of Visit</h5>
            <p>
              {" "}
              <small>Edit Visit Purpose Details</small>
            </p>
          </div>
        </div>
        <div className="col-md-8"> {/* Adjusted column width */}
          <div className="card shadow-sm rounded-4 border-0"> {/* Added rounded-4 border-0 */}
            <div className="d-flex justify-content-between card-header bg-white align-items-center rounded-top-4"> {/* Added rounded-top-4 */}
              <strong>Edit Visit Purpose Details</strong>
              <button
                type="button" // Explicitly set type to button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedPurpose(""); // Clear for add
                  setModalType("add");
                  setShowModal(true);
                }}
              >
                Add New
              </button>
            </div>
            <ul className="list-group list-group-flush"> {/* Used list-group for better styling */}
              {settings.visit_purposes.length === 0 ? (
                <li className="list-group-item text-center text-muted py-3">No purposes defined.</li>
              ) : (
                settings.visit_purposes.map((p, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {p}
                    <button
                      type="button" // Explicitly set type to button
                      className="btn btn-link text-primary" // Styled as primary link
                      onClick={() => {
                        setSelectedPurpose(p);
                        setModalType("edit");
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Date & Time Format */}
      <div className="row my-3">
        <div className="col-md-4"> {/* Adjusted column width */}
          <div className="p-3">
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
        <div className="col-md-8"> {/* Adjusted column width */}
          <div className="card shadow-sm p-4 rounded-4 border-0"> {/* Added rounded-4 border-0 */}
            <h6 className="mb-3 fw-semibold">Date Format</h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dateFormat"
                    id="mdy"
                    value="MM/DD/YYYY"
                    checked={settings.date_format === "MM/DD/YYYY"}
                    onChange={(e) => handleUpdateSetting('date_format', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="mdy">
                    MM/DD/YYYY
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dateFormat"
                    id="dmy"
                    value="DD/MM/YYYY"
                    checked={settings.date_format === "DD/MM/YYYY"}
                    onChange={(e) => handleUpdateSetting('date_format', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="dmy">
                    DD/MM/YYYY
                  </label>
                </div>
              </div>
            </div>

            <h6 className="mb-3 fw-semibold">Time Format</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="timeFormat"
                    id="12hour"
                    value="12-hour"
                    checked={settings.time_format === "12-hour"}
                    onChange={(e) => handleUpdateSetting('time_format', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="12hour">
                    12-Hour (AM/PM)
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="timeFormat"
                    id="24hour"
                    value="24-hour"
                    checked={settings.time_format === "24-hour"}
                    onChange={(e) => handleUpdateSetting('time_format', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="24hour">
                    24-Hour
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="text-secondary" />

      {/* Language Preference */}
      <div className="row my-3">
        <div className="col-md-4"> {/* Adjusted column width */}
          <div className="p-3">
            <h5 className="mb-3">Language Preference</h5>
            <p>
              {" "}
              <small>
                Choose preferred language for the interface.
              </small>
            </p>
          </div>
        </div>
        <div className="col-md-8"> {/* Adjusted column width */}
          <div className="card shadow-sm p-4 rounded-4 border-0"> {/* Added rounded-4 border-0 */}
            <h6 className="mb-3 fw-semibold">Choose Language</h6>

            <div className="row align-items-center">
              <div className="col-md-12 mb-2">
                <select
                  className="form-select w-100"
                  value={settings.language_preference}
                  onChange={(e) => handleUpdateSetting('language_preference', e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Arabic">Arabic</option>
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
