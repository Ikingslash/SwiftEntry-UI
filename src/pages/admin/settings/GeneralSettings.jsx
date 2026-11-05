import { useState, useEffect } from "react";
import PurposeModal from "../include/PurposeModal";
import api from "../../../context/api";

function GeneralSettings() {
  const [settings, setSettings] = useState({
    primary_color: "",
    timezone: "WAT",
    visit_purposes: [],
    buildings: [],
    floors: [],
    special_requirements: [],
    date_format: "MM/DD/YYYY",
    time_format: "12-hour",
    language_preference: "English",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purpose of Visit modal state
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Buildings modal state
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [buildingModalType, setBuildingModalType] = useState("");
  const [showBuildingModal, setShowBuildingModal] = useState(false);

  // Floors modal state
  const [selectedFloor, setSelectedFloor] = useState("");
  const [floorModalType, setFloorModalType] = useState("");
  const [showFloorModal, setShowFloorModal] = useState(false);

  // Special Requirements modal state
  const [selectedRequirement, setSelectedRequirement] = useState("");
  const [requirementModalType, setRequirementModalType] = useState("");
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState("blue");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const applyLanguage = (lang) => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
        localStorage.setItem("selectedLanguage", lang);
      }
    };

    const savedLang = localStorage.getItem("selectedLanguage") || "en";
    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        applyLanguage(savedLang);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/settings");
      const fetchedSettings = response.data.general_settings;
      setSettings({
        primary_color: fetchedSettings.primary_color || "",
        timezone: fetchedSettings.timezone || "WAT",
        visit_purposes: fetchedSettings.visit_purposes || [],
        buildings: fetchedSettings.buildings || [],
        floors: fetchedSettings.floors || [],
        special_requirements: fetchedSettings.special_requirements || [],
        date_format: fetchedSettings.date_format || "MM/DD/YYYY",
        time_format: fetchedSettings.time_format || "12-hour",
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
      await api.post("/admin/settings/update", payload);
      fetchSettings();
    } catch (err) {
      console.error(`Error updating setting '${key}':`, err.response?.data || err.message);
    }
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    let colorCode = '';
    switch (theme) {
      case 'blue': colorCode = '#007bff'; break;
      case 'orange': colorCode = '#fd7e14'; break;
      case 'purple': colorCode = '#6f42c1'; break;
      default: colorCode = '';
    }
    setSettings(prev => ({ ...prev, primary_color: colorCode }));
    handleUpdateSetting('primary_color', colorCode);
  };

  // Purpose handlers
  const handleAddPurpose = async (newPurpose) => {
    try {
      await api.post("/admin/settings/add-purpose", { purpose: newPurpose });
      setShowModal(false);
      fetchSettings();
    } catch (err) {
      console.error("Error adding purpose:", err);
    }
  };

  const handleUpdatePurpose = async (updatedPurpose) => {
    try {
      await api.post("/admin/settings/update-purpose", { old_purpose: selectedPurpose, new_purpose: updatedPurpose });
      setShowModal(false);
      fetchSettings();
    } catch (err) {
      console.error("Error updating purpose:", err);
    }
  };

  const handleDeletePurpose = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedPurpose}"?`)) {
      try {
        await api.post("/admin/settings/delete-purpose", { purpose: selectedPurpose });
        setShowModal(false);
        fetchSettings();
      } catch (err) {
        console.error("Error deleting purpose:", err);
      }
    }
  };

  // Building handlers
  const handleAddBuilding = async (newBuilding) => {
    try {
      await api.post("/admin/settings/add-building", { building: newBuilding });
      setShowBuildingModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBuilding = async (updatedBuilding) => {
    try {
      await api.post("/admin/settings/update-building", { old_building: selectedBuilding, new_building: updatedBuilding });
      setShowBuildingModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBuilding = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedBuilding}"?`)) {
      try {
        await api.post("/admin/settings/delete-building", { building: selectedBuilding });
        setShowBuildingModal(false);
        fetchSettings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Floor handlers
  const handleAddFloor = async (newFloor) => {
    try {
      await api.post("/admin/settings/add-floor", { floor: newFloor });
      setShowFloorModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFloor = async (updatedFloor) => {
    try {
      await api.post("/admin/settings/update-floor", { old_floor: selectedFloor, new_floor: updatedFloor });
      setShowFloorModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFloor = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedFloor}"?`)) {
      try {
        await api.post("/admin/settings/delete-floor", { floor: selectedFloor });
        setShowFloorModal(false);
        fetchSettings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Special Requirements handlers
  const handleAddRequirement = async (newReq) => {
    try {
      await api.post("/admin/settings/add-special-requirement", { requirement: newReq });
      setShowRequirementModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRequirement = async (updatedReq) => {
    try {
      await api.post("/admin/settings/update-special-requirement", { old_requirement: selectedRequirement, new_requirement: updatedReq });
      setShowRequirementModal(false);
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequirement = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedRequirement}"?`)) {
      try {
        await api.post("/admin/settings/delete-special-requirement", { requirement: selectedRequirement });
        setShowRequirementModal(false);
        fetchSettings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const changeLanguage = (lang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
      localStorage.setItem("selectedLanguage", lang);
    }
  };

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ha", name: "Hausa", flag: "🇳🇬" },
    { code: "yo", name: "Yoruba", flag: "🇳🇬" },
    { code: "ig", name: "Igbo", flag: "🇳🇬" },
    { code: "ff", name: "Fulfulde", flag: "🌍" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
  ];

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-medium">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8 text-xs text-slate-700">
      {/* 1. Appearance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Appearance</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Customize the Interface Colour themes to reflect your organization’s identity. Maintain consistency across all dashboards and Platforms.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-4">
            <div
              onClick={() => handleThemeSelect("blue")}
              className={`w-48 p-4 rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-xs ${selectedTheme === "blue" ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
            >
              {/* Mini mock UI header box */}
              <div className="w-full h-16 rounded-xl bg-blue-600 mb-3 flex items-start justify-end p-2">
                {selectedTheme === "blue" && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <i className="bi bi-check text-xs"></i>
                  </div>
                )}
              </div>
              <p className="text-center font-semibold text-slate-800 text-xs">Default</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Time Zone Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Time Zone Management</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Set and manage time zones to ensure accurate timestamps for visitor check-ins, reports, and notifications.
          </p>
        </div>
        <div className="md:col-span-2 max-w-md">
          <label className="block font-semibold text-slate-700 mb-2">Time Zone</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            value={settings.timezone}
            onChange={(e) => handleUpdateSetting("timezone", e.target.value)}
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

      {/* 3. Purpose of Visit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Purpose of Visit</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Edit Visit Purpose Details
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/80 bg-white">
              <span className="font-semibold text-slate-800 text-xs">Edit Visit Purpose Details</span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shrink-0 whitespace-nowrap"
                onClick={() => { setSelectedPurpose(""); setModalType("add"); setShowModal(true); }}
              >
                Add New
              </button>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {settings.visit_purposes.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">No purposes defined.</div>
              ) : (
                settings.visit_purposes.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className="font-medium text-slate-800 min-w-0 break-words">{p}</span>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                      onClick={() => { setSelectedPurpose(p); setModalType("edit"); setShowModal(true); }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Buildings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Buildings</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Manage the list of buildings visitors can be directed to.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/80 bg-white">
              <span className="font-semibold text-slate-800 text-xs">Edit Buildings</span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shrink-0 whitespace-nowrap"
                onClick={() => { setSelectedBuilding(""); setBuildingModalType("add"); setShowBuildingModal(true); }}
              >
                Add New
              </button>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {settings.buildings.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">No buildings defined.</div>
              ) : (
                settings.buildings.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className="font-medium text-slate-800 min-w-0 break-words">{b}</span>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                      onClick={() => { setSelectedBuilding(b); setBuildingModalType("edit"); setShowBuildingModal(true); }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Floors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Floors</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Manage the list of floors visitors can be directed to.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/80 bg-white">
              <span className="font-semibold text-slate-800 text-xs">Edit Floors</span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shrink-0 whitespace-nowrap"
                onClick={() => { setSelectedFloor(""); setFloorModalType("add"); setShowFloorModal(true); }}
              >
                Add New
              </button>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {settings.floors.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">No floors defined.</div>
              ) : (
                settings.floors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className="font-medium text-slate-800 min-w-0 break-words">{f}</span>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                      onClick={() => { setSelectedFloor(f); setFloorModalType("edit"); setShowFloorModal(true); }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Special Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Special Requirements</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Manage the list of special requirements visitors can select.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/80 bg-white">
              <span className="font-semibold text-slate-800 text-xs">Edit Special Requirements</span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] shrink-0 whitespace-nowrap"
                onClick={() => { setSelectedRequirement(""); setRequirementModalType("add"); setShowRequirementModal(true); }}
              >
                Add New
              </button>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {settings.special_requirements.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">No special requirements defined.</div>
              ) : (
                settings.special_requirements.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className="font-medium text-slate-800 min-w-0 break-words">{r}</span>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                      onClick={() => { setSelectedRequirement(r); setRequirementModalType("edit"); setShowRequirementModal(true); }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Date & Time Format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Date & Time Format</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Choose preferred formats for dates and times to align with organizational requirements.
          </p>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="block font-semibold text-slate-800 mb-2">Date Format</span>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${settings.date_format === 'MM/DD/YYYY' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'}`}>
                <input
                  type="radio"
                  name="dateFormat"
                  value="MM/DD/YYYY"
                  checked={settings.date_format === "MM/DD/YYYY"}
                  onChange={(e) => handleUpdateSetting("date_format", e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mr-2.5"
                />
                <span className="font-medium text-slate-800">MM/DD/YYYY</span>
              </label>
              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${settings.date_format === 'DD/MM/YYYY' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'}`}>
                <input
                  type="radio"
                  name="dateFormat"
                  value="DD/MM/YYYY"
                  checked={settings.date_format === "DD/MM/YYYY"}
                  onChange={(e) => handleUpdateSetting("date_format", e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mr-2.5"
                />
                <span className="font-medium text-slate-800">DD/MM/YYYY</span>
              </label>
            </div>
          </div>

          <div>
            <span className="block font-semibold text-slate-800 mb-2">Time Format</span>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${settings.time_format === '12-hour' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'}`}>
                <input
                  type="radio"
                  name="timeFormat"
                  value="12-hour"
                  checked={settings.time_format === "12-hour"}
                  onChange={(e) => handleUpdateSetting("time_format", e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mr-2.5"
                />
                <span className="font-medium text-slate-800">12-Hour (AM/PM)</span>
              </label>
              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${settings.time_format === '24-hour' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'}`}>
                <input
                  type="radio"
                  name="timeFormat"
                  value="24-hour"
                  checked={settings.time_format === "24-hour"}
                  onChange={(e) => handleUpdateSetting("time_format", e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mr-2.5"
                />
                <span className="font-medium text-slate-800">24-Hour</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Language Preference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Language Preference</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Choose preferred language for the interface.
          </p>
        </div>
        <div className="md:col-span-2 max-w-md">
          <label className="block font-semibold text-slate-700 mb-2">Choose Language</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            value={settings.language_preference}
            onChange={(e) => {
              const selectedLang = languages.find((lang) => lang.name === e.target.value);
              if (selectedLang) {
                changeLanguage(selectedLang.code);
                handleUpdateSetting("language_preference", selectedLang.name);
              }
            }}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modals */}
      <PurposeModal
        type={modalType}
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedPurpose={selectedPurpose}
        onAdd={handleAddPurpose}
        onUpdate={handleUpdatePurpose}
        onDelete={handleDeletePurpose}
      />
      <PurposeModal
        type={buildingModalType}
        show={showBuildingModal}
        onHide={() => setShowBuildingModal(false)}
        selectedPurpose={selectedBuilding}
        onAdd={handleAddBuilding}
        onUpdate={handleUpdateBuilding}
        onDelete={handleDeleteBuilding}
      />
      <PurposeModal
        type={floorModalType}
        show={showFloorModal}
        onHide={() => setShowFloorModal(false)}
        selectedPurpose={selectedFloor}
        onAdd={handleAddFloor}
        onUpdate={handleUpdateFloor}
        onDelete={handleDeleteFloor}
      />
      <PurposeModal
        type={requirementModalType}
        show={showRequirementModal}
        onHide={() => setShowRequirementModal(false)}
        selectedPurpose={selectedRequirement}
        onAdd={handleAddRequirement}
        onUpdate={handleUpdateRequirement}
        onDelete={handleDeleteRequirement}
      />
    </div>
  );
}

export default GeneralSettings;