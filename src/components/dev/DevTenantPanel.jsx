import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, RefreshCw, ShieldCheck, UserCog, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useTenant } from "../../context/TenantContext";
import { demoPersonas } from "../../mocks/seed.js";
import { resetMockDb } from "../../mocks/index.js";

const personas = demoPersonas();
const buildingPersonas = personas.filter((p) => p.scope === "building");
const tenantPersonas = personas.filter((p) => p.scope === "tenant");

function PersonaRow({ persona, onPick, busy }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onPick(persona)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-start gap-2 cursor-pointer border-0 bg-transparent"
    >
      <span
        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
          persona.status === "disabled" ? "bg-rose-400" : "bg-emerald-400"
        }`}
      />
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-slate-800 truncate">{persona.name}</span>
        <span className="block text-[10px] text-slate-500 truncate">
          {persona.role.replace("_", " ")} · {persona.tenant_name}
        </span>
        <span className="block text-[9px] text-slate-400 truncate">{persona.email}</span>
      </span>
    </button>
  );
}

/**
 * Dev-only persona switcher.
 *
 * This exists so the multi-tenant rules can be demonstrated without typing
 * five different passwords. It is never rendered when mock mode is off.
 */
export default function DevTenantPanel() {
  const { user, demoLogin, logout } = useAuth();
  const { refresh, isBuildingScope, viewingTenantId } = useTenant();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const pick = async (persona) => {
    setBusy(true);
    try {
      const ok = await demoLogin(persona.email);
      if (ok) {
        setOpen(false);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    resetMockDb();
    toast.info("Demo data reset.");
    if (user) {
      try {
        await refresh();
      } catch {
        // refresh is best-effort
      }
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-[#053561] text-white px-4 py-2.5 text-xs font-bold shadow-xl shadow-blue-900/20 hover:bg-[#04294b] cursor-pointer border border-white/10"
      >
        <UserCog className="w-4 h-4" />
        Demo personas
        {isBuildingScope && viewingTenantId && (
          <span className="ml-1 rounded-full bg-amber-400 text-amber-950 px-2 py-0.5 text-[9px] font-extrabold">
            filtered
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[min(92vw,22rem)] max-h-[80vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#053561] text-white">
        <UserCog className="w-4 h-4" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold leading-tight">Demo personas</p>
          <p className="text-[9px] text-white/70 truncate">
            {user ? `${user.name} · ${user.email}` : "Not signed in"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer border-0 bg-transparent text-white"
          aria-label="Close demo panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reset data
        </button>
        <Link
          to="/dev/isolation"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 no-underline"
        >
          <ShieldCheck className="w-3 h-3" />
          Isolation checks
        </Link>
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="ml-auto text-[10px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer bg-transparent border-0"
          >
            Sign out
          </button>
        )}
      </div>

      <div className="overflow-y-auto px-2 py-2">
        <p className="px-2 pt-1 pb-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
          Building-wide
        </p>
        {buildingPersonas.map((persona) => (
          <PersonaRow key={persona.id} persona={persona} onPick={pick} busy={busy} />
        ))}

        <p className="px-2 pt-3 pb-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
          Tenant users
        </p>
        {tenantPersonas.map((persona) => (
          <PersonaRow key={persona.id} persona={persona} onPick={pick} busy={busy} />
        ))}
      </div>

      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 text-[9px] text-slate-500 flex items-center gap-1">
        <ChevronDown className="w-3 h-3" />
        Password for every demo account: <strong>Demo1234!</strong>
      </div>
    </div>
  );
}
