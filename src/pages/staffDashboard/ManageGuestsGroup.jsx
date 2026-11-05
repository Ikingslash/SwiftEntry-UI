import { useState } from "react";
import StaffTopHeader from "./include/StaffTopHeader";
import TabIndividual from "./include/TabIndividual";
import TabGroup from "./include/TabGroup";

function ManageGuestsGroup() {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <StaffTopHeader />

      {/* Header Container */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
            Manage Guests
          </p>
          <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
            View, approve and track all guest visits.
          </p>
        </div>

        {/* Larger & More Prominent Fully Rounded Pill Switcher */}
        <div className="inline-flex self-start sm:self-auto p-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm">
          <button
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 border-0 cursor-pointer ${activeTab === "individual"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            onClick={() => setActiveTab("individual")}
          >
            Individual
          </button>
          <button
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 border-0 cursor-pointer ${activeTab === "group"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900"
              }`}
            onClick={() => setActiveTab("group")}
          >
            Group
          </button>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="max-w-[1140px] mx-auto px-4">
        {activeTab === "individual" && <TabIndividual />}
        {activeTab === "group" && <TabGroup />}
      </div>
    </div>
  );
}

export default ManageGuestsGroup;
