import React, { useState } from "react";

function NewGuest() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "individual" ? "active" : ""}`} onClick={() => setActiveTab("individual")}>
            Individual Guest
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "group" ? "active" : ""}`} onClick={() => setActiveTab("group")}>
            Group Registration
          </button>
        </li>
      </ul>

      <div className="mt-3">
        {activeTab === "individual" && <h3>Register Individual Guest</h3>}
        {activeTab === "group" && <h3>Register Guest Group</h3>}
      </div>
    </div>
  );
}

export default NewGuest;
