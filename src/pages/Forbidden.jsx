import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { dashboardFor } from "../tenancy/scope.js";

function Forbidden({
  title = "Access denied",
  message = "Your account does not have access to this area.",
  reason = null,
}) {
  const { user, logout } = useAuth();
  const home = user ? dashboardFor(user) : "/";

  return (
    <main className="min-h-dvh bg-[#edf5ff] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>

        {reason && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            {reason}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to={home}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#053561] hover:bg-[#04294b] text-white text-xs font-semibold no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

export default Forbidden;
