import { useState } from "react";
import RegisterNewGuestIndividual from "./RegisterNewGuestIndividual";
import RegisterNewGuestGroup from "./RegisterNewGuestGroup";

function RegisterNewGuest() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div className="min-h-full bg-[#F0F7FF] pb-12 font-sans">
      {/* Header Container */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Register Guest
          </p>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0 mt-1">
            Pre-register an individual visitor or a visiting group.
          </p>
        </div>

        {/* Pill Switcher */}
        <div className="inline-flex p-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm self-start sm:self-auto">
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 border-0 cursor-pointer ${
              activeTab === "individual"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("individual")}
          >
            Individual
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 border-0 cursor-pointer ${
              activeTab === "group"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("group")}
          >
            Group
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        {activeTab === "individual" && <RegisterNewGuestIndividual />}
        {activeTab === "group" && <RegisterNewGuestGroup />}
      </div>
    </div>
  );
}

export default RegisterNewGuest;
