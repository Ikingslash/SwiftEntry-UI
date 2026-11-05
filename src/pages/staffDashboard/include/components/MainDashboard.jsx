// MainDashboard.jsx
import {
  Users,
  CalendarCheck,
  Eye,
  BellRing,
  Clock,
  ArrowRight,
} from "lucide-react";
import UserAvatar from "../../../../components/UserAvatar";

export default function MainDashboard({
  user,
  summaryData,
  notifications,
  todaysGuests,
  goToRecents,
  goToGuests,
}) {
  return (
    <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-12 space-y-8 font-sans">

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-0">
            Welcome Back, {user?.name || "User"}
          </h1>
          <p className="text-slate-500 text-xs mt-1 mb-0">
            Here is what&apos;s happening at your front desk today.
          </p>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Visitors Today */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">
              Total Visitors Today
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-0">
              {summaryData?.total_visitors_today ?? 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">
              Upcoming Visits
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mb-0">
              {summaryData?.upcoming_visits ?? 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Visits */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0">
              Pending Visits
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mb-0">
              {summaryData?.pending_guests ?? 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Homogeneous Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Recent Activities</h5>
            <button
              type="button"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
              onClick={goToRecents}
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((item, index) => (
                <div key={index} className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center gap-4 transition-all hover:border-slate-200">
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
                    <h6 className="mb-1 font-bold text-slate-900 text-xs truncate">{item.title}</h6>
                    <p className="text-slate-500 text-xs mb-0">
                      {item.message} <span className="text-slate-400">({item.created_at})</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-3xl text-center text-slate-400 text-xs border border-slate-100">
                No recent notifications.
              </div>
            )}
          </div>
        </div>

        {/* Today's Guests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="font-bold text-slate-900 text-sm mb-0">Today&apos;s Guests</h5>
            <button
              type="button"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
              onClick={goToGuests}
            >
              See more <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {!todaysGuests || todaysGuests.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center text-slate-400 text-xs border border-slate-100">
                No guests for today.
              </div>
            ) : (
              todaysGuests.map((guest) => (
                <div key={guest.id} className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between transition-all hover:border-slate-200">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      image={guest.visitor?.photo || guest.visitor?.image_url}
                      firstName={guest.visitor?.name || "Visitor"}
                      size={44}
                      className="rounded-full shrink-0"
                    />
                    <div className="min-w-0">
                      <h6 className="mb-1 font-bold text-slate-900 text-xs truncate">
                        {guest.visitor?.name || "Unknown Visitor"}
                      </h6>
                      <small className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {guest.visit_time ? new Date(guest.visit_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "No time"}
                      </small>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full shrink-0">
                    Scheduled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}