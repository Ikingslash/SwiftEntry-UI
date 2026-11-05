import { ArrowLeft, BellRing } from 'lucide-react';

export default function RecentActivitiesPage({ recents, loading, goBack }) {
  return (
    <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-12 space-y-6 font-sans">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0">Recent Activities</h1>
          <p className="text-slate-500 text-xs mt-0.5 mb-0">Full log of recent visitor activities and notifications.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-medium">
          Loading recent activities...
        </div>
      ) : recents && recents.length > 0 ? (
        <div className="space-y-3">
          {recents.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:border-slate-200">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "rgba(255, 204, 0, 0.12)",
                  color: "#d97706",
                }}
              >
                <BellRing className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="mb-1 font-bold text-slate-900 text-xs truncate">
                  {item.visitor?.name || 'Unknown Visitor'} - {item.purpose}
                </h6>
                <p className="text-slate-500 text-xs mb-0">
                  {new Date(item.visit_time).toLocaleDateString("en-US", { weekday: "long" })}
                  {" | "}
                  {new Date(item.visit_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <p className="text-slate-500 text-xs font-medium mb-0">No recent activities found.</p>
        </div>
      )}
    </div>
  );
}