import { ArrowLeft, Clock } from 'lucide-react';
import UserAvatar from '../../../../components/UserAvatar';

export default function TodaysGuestsPage({ todaysGuests, loading, goBack }) {
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0">Today&apos;s Guests</h1>
          <p className="text-slate-500 text-xs mt-0.5 mb-0">Complete list of visitors scheduled for today.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-medium">
          Loading today&apos;s guests...
        </div>
      ) : todaysGuests && todaysGuests.length > 0 ? (
        <div className="space-y-3">
          {todaysGuests.map((guest) => (
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
                    {guest.visitor?.name || 'Unknown Visitor'}
                  </h6>
                  <small className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(guest.visit_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) || "No time"}
                  </small>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full shrink-0">
                Scheduled
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <p className="text-slate-500 text-xs font-medium mb-0">No guests for today.</p>
        </div>
      )}
    </div>
  );
}