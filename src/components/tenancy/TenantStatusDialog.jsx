import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import {
  BellOff,
  BellRing,
  Check,
  DatabaseZap,
  History,
  KeyRound,
  Loader2,
  LockKeyhole,
  Pause,
  Play,
  QrCode,
  ScanLine,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import api from "../../context/api";

/**
 * Confirmation dialog for tenant status changes (deactivate / activate / delete)
 * plus the toast shown after a successful change.
 */

const ACTIONS = {
  deactivate: {
    icon: Pause,
    tone: {
      tile: "bg-amber-50 text-amber-600 ring-amber-100",
      button: "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-300",
      bullet: "text-amber-600 bg-amber-50",
    },
    title: (name) => `Deactivate ${name}?`,
    lead: "Everyone in this tenant loses access until you turn it back on.",
    confirm: "Deactivate tenant",
    busy: "Deactivating…",
    effects: [
      { icon: LockKeyhole, title: "Sign-in is blocked", text: "Admins, front desk and staff in this tenant can't log in." },
      { icon: QrCode, title: "Visitor codes stop working", text: "Registered visitors can't check in or out with their code or QR." },
      { icon: BellOff, title: "Notifications pause", text: "Hosts stop getting visitor alerts." },
      { icon: ShieldCheck, title: "Nothing is lost", text: "Staff, visits and history are kept. You can activate it again any time.", positive: true },
    ],
    toast: {
      title: "Tenant deactivated",
      text: (name) => `${name} can no longer log in. Its data is kept.`,
    },
  },
  activate: {
    icon: Play,
    tone: {
      tile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      button: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300",
      bullet: "text-emerald-600 bg-emerald-50",
    },
    title: (name) => `Activate ${name}?`,
    lead: "Access is restored exactly as it was before it was deactivated.",
    confirm: "Activate tenant",
    busy: "Activating…",
    effects: [
      { icon: KeyRound, title: "Sign-in works again", text: "Admins, front desk and staff can log in." },
      { icon: ScanLine, title: "Visitor codes work again", text: "Unexpired codes and QR codes can be used to check in and out." },
      { icon: BellRing, title: "Notifications resume", text: "Hosts start getting visitor alerts again." },
      { icon: History, title: "Everything is where it was", text: "Staff, visits and history are unchanged." },
    ],
    toast: {
      title: "Tenant activated",
      text: (name) => `${name} can log in and check visitors in again.`,
    },
  },
  delete: {
    icon: Trash2,
    tone: {
      tile: "bg-rose-50 text-rose-600 ring-rose-100",
      button: "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-300",
      bullet: "text-rose-600 bg-rose-50",
    },
    title: (name) => `Delete ${name}?`,
    lead: "This permanently removes the tenant. It can't be undone.",
    confirm: "Delete tenant",
    busy: "Deleting…",
    effects: [
      { icon: DatabaseZap, title: "All of its data is erased", text: "Staff accounts, visitors, visit history, codes and settings." },
      { icon: LockKeyhole, title: "Sign-in is removed", text: "Nobody in this tenant will be able to log in." },
      { icon: QrCode, title: "Visitor codes stop working", text: "Registered visitors can no longer check in or out." },
    ],
    toast: {
      title: "Tenant deleted",
      text: (name) => `${name} and all of its data were removed.`,
    },
  },
};

function TenantToast({ kind, name, closeToast }) {
  const config = ACTIONS[kind];
  const Icon = kind === "delete" ? Trash2 : Check;
  return (
    <div className="flex items-start gap-3 w-full">
      <span className={`mt-0.5 w-9 h-9 rounded-xl ring-1 ring-inset flex items-center justify-center shrink-0 ${config.tone.tile}`}>
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 mb-0.5">{config.toast.title}</p>
        <p className="text-xs text-slate-500 leading-snug mb-0">{config.toast.text(name)}</p>
      </div>
      <button
        type="button"
        onClick={closeToast}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const PROGRESS = {
  deactivate: "!bg-amber-500",
  activate: "!bg-emerald-500",
  delete: "!bg-rose-500",
};

export function showTenantToast(kind, name) {
  toast((props) => <TenantToast kind={kind} name={name} {...props} />, {
    position: "top-right",
    autoClose: 5000,
    icon: false,
    closeButton: false,
    className: "!rounded-2xl !shadow-xl !shadow-slate-900/10 !border !border-slate-100 !p-4 !min-h-0",
    progressClassName: PROGRESS[kind],
  });
}

/**
 * @param {"deactivate"|"activate"|"delete"} kind
 * @param {{id:number|string,name:string,status:string}} tenant
 * @param {(kind:string, tenant:object) => void} onDone  called after success
 * @param {(kind:string) => void} [onSwitch]  lets "Deactivate instead" swap the dialog
 */
export default function TenantStatusDialog({ kind, tenant, onClose, onDone, onSwitch }) {
  const config = ACTIONS[kind];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [typed, setTyped] = useState("");

  const isDelete = kind === "delete";
  const canConfirm = !busy && (!isDelete || typed.trim().toLowerCase() === tenant.name.trim().toLowerCase());

  useEffect(() => {
    setTyped("");
    setError("");
  }, [kind, tenant.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const handleConfirm = async (event) => {
    event?.preventDefault();
    if (!canConfirm) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "delete") await api.delete(`/tenants/${tenant.id}`);
      else await api.post(`/tenants/${tenant.id}/${kind === "deactivate" ? "suspend" : "activate"}`);
      showTenantToast(kind, tenant.name);
      await onDone?.(kind, tenant);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const Icon = config.icon;
  const titleId = `tenant-${kind}-title`;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-[2px] p-4"
      onClick={busy ? undefined : onClose}
    >
      <form
        onSubmit={handleConfirm}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl shadow-slate-950/20 text-slate-800 overflow-hidden animate-fade-in"
      >
        <div className="p-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <span className={`w-11 h-11 rounded-xl ring-1 ring-inset flex items-center justify-center ${config.tone.tile}`}>
              <Icon className="w-5 h-5" strokeWidth={2.25} />
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="-mr-2 -mt-2 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 id={titleId} className="mt-4 mb-1 text-lg font-bold tracking-tight text-slate-900">
            {config.title(tenant.name)}
          </h2>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-0">{config.lead}</p>

          <ul className="mt-5 mb-0 p-0 list-none space-y-3.5">
            {config.effects.map(({ icon: EffectIcon, title, text, positive }) => (
              <li key={title} className="flex items-start gap-3">
                <span
                  className={`mt-px w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    positive ? "text-emerald-600 bg-emerald-50" : config.tone.bullet
                  }`}
                >
                  <EffectIcon className="w-3.5 h-3.5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 mb-0">{title}</p>
                  <p className="text-xs text-slate-500 leading-snug mb-0">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {isDelete && (
            <div className="mt-6">
              <label htmlFor="confirm-tenant-name" className="block text-xs text-slate-600 mb-1.5">
                Type <span className="font-semibold text-slate-900">{tenant.name}</span> to confirm
              </label>
              <input
                id="confirm-tenant-name"
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={busy}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-shadow"
                placeholder={tenant.name}
              />
              {tenant.status !== "suspended" && onSwitch && (
                <p className="mt-3 mb-0 text-xs text-slate-500">
                  Only need to pause it?{" "}
                  <button
                    type="button"
                    onClick={() => onSwitch("deactivate")}
                    disabled={busy}
                    className="p-0 border-0 bg-transparent font-semibold text-slate-800 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-800 cursor-pointer"
                  >
                    Deactivate instead
                  </button>
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 mb-0 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            autoFocus={!isDelete}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:opacity-40 disabled:cursor-not-allowed ${config.tone.button}`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? config.busy : config.confirm}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
