import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Check, ChevronDown, Layers, Pause, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useTenant } from "../../context/TenantContext";
import api from "../../context/api";
import { TENANT_STATUS } from "../../tenancy/constants";
import TenantStatusDialog from "./TenantStatusDialog";

/**
 * Building-admin tenant filter.
 *
 * Not rendered for tenant users at all: their identity is fixed by the token,
 * so offering them a selector would be a lie.
 *
 * Each tenant row also carries its status actions (deactivate / activate,
 * delete). A native <select> can't hold buttons, so the list is a popover.
 */
function TenantSwitcher({ className = "", light = false }) {
  const { isBuildingScope, tenants, viewingTenantId, setViewingTenant, loading, refresh } = useTenant();
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(null); // { kind, tenant }
  const triggerRef = useRef(null);

  if (!isBuildingScope) return null;

  const base = light
    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  const labelTone = light ? "text-white/70" : "text-slate-400";
  const selectTone = light ? "text-white" : "text-slate-800";

  const current = tenants.find((t) => String(t.id) === String(viewingTenantId));

  const choose = (value) => {
    setViewingTenant(value || null);
    setOpen(false);
  };

  const openDialog = (kind, tenant) => {
    setOpen(false);
    setDialog({ kind, tenant });
  };

  const handleDone = async (kind, tenant) => {
    if (kind === "delete" && String(viewingTenantId) === String(tenant.id)) setViewingTenant(null);
    await refresh();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter data by tenant"
        className={`block w-full text-left rounded-xl border ${base} px-3 py-2 cursor-pointer transition-colors disabled:opacity-60 ${className}`}
      >
        <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide ${labelTone}`}>
          {viewingTenantId ? <Building2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
          Tenant filter
        </span>
        <span className={`mt-1 flex items-center justify-between gap-2 text-[11px] font-semibold ${selectTone}`}>
          <span className="truncate">
            {current ? current.name : "All tenants"}
            {current?.status === TENANT_STATUS.SUSPENDED ? " (deactivated)" : ""}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <TenantMenu
          anchorRef={triggerRef}
          tenants={tenants}
          selectedId={viewingTenantId}
          onChoose={choose}
          onAction={openDialog}
          onAdd={() => {
            setOpen(false);
            setShowAddTenant(true);
          }}
          onClose={() => setOpen(false)}
        />
      )}

      {dialog && (
        <TenantStatusDialog
          kind={dialog.kind}
          tenant={dialog.tenant}
          onClose={() => setDialog(null)}
          onDone={handleDone}
          onSwitch={(kind) => setDialog((d) => ({ ...d, kind }))}
        />
      )}

      {showAddTenant && <AddTenantModal onClose={() => setShowAddTenant(false)} />}
    </>
  );
}

function TenantMenu({ anchorRef, tenants, selectedId, onChoose, onAction, onAdd, onClose }) {
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(Math.max(r.width, 320), window.innerWidth - 16);
      const left = Math.min(r.left, window.innerWidth - width - 8);
      setPos({
        top: r.bottom + 6,
        left: Math.max(8, left),
        width,
        maxHeight: Math.max(220, window.innerHeight - r.bottom - 20),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSelected = (id) => String(selectedId ?? "") === String(id ?? "");

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1000]" onClick={onClose} />
      <div
        role="listbox"
        aria-label="Tenants"
        style={pos ?? { visibility: "hidden" }}
        className="fixed z-[1001] flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-950/20 text-slate-800 overflow-hidden animate-fade-in"
      >
        <div className="overflow-y-auto p-1.5">
          <button
            type="button"
            role="option"
            aria-selected={isSelected("")}
            onClick={() => onChoose("")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left border-0 cursor-pointer transition-colors ${
              isSelected("") ? "bg-blue-50" : "bg-transparent hover:bg-slate-50"
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span className="flex-1 text-xs font-semibold">All tenants</span>
            {isSelected("") && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {tenants.length > 0 && (
            <p className="px-2.5 pt-2.5 pb-1 mb-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Tenants
            </p>
          )}

          {tenants.map((tenant) => {
            const suspended = tenant.status === TENANT_STATUS.SUSPENDED;
            const selected = isSelected(tenant.id);
            return (
              <div
                key={tenant.id}
                className={`flex items-center gap-0.5 pr-1 rounded-xl transition-colors ${
                  selected ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onChoose(String(tenant.id))}
                  className="flex-1 min-w-0 flex items-center gap-2.5 pl-2.5 py-2 text-left border-0 bg-transparent cursor-pointer"
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      suspended ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tenant.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${
                        suspended ? "text-slate-500" : "text-slate-800"
                      }`}
                    >
                      <span className="truncate">{tenant.name}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${suspended ? "bg-amber-400" : "bg-emerald-500"}`} />
                      {suspended ? "Deactivated" : "Active"}
                    </span>
                  </span>
                </button>

                {suspended ? (
                  <RowAction label="Activate" tone="emerald" icon={Play} iconOnly onClick={() => onAction("activate", tenant)} />
                ) : (
                  <RowAction label="Deactivate" tone="amber" icon={Pause} iconOnly onClick={() => onAction("deactivate", tenant)} />
                )}
                <RowAction label="Delete" tone="rose" icon={Trash2} iconOnly onClick={() => onAction("delete", tenant)} />
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 p-1.5">
          <button
            type="button"
            onClick={onAdd}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-blue-700 bg-transparent hover:bg-blue-50 border-0 cursor-pointer transition-colors"
          >
            <span className="w-7 h-7 rounded-lg border border-dashed border-blue-300 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </span>
            Add a tenant
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

const ROW_TONES = {
  amber: "text-amber-700 hover:bg-amber-100/70",
  emerald: "text-emerald-700 hover:bg-emerald-100/70",
  rose: "text-slate-400 hover:text-rose-600 hover:bg-rose-100/70",
};

function RowAction({ label, tone, icon: Icon, onClick, iconOnly = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${label} tenant`}
      aria-label={`${label} tenant`}
      className={`shrink-0 inline-flex items-center gap-1 h-7 rounded-lg border-0 bg-transparent text-[11px] font-semibold cursor-pointer transition-colors ${
        iconOnly ? "w-7 justify-center" : "px-2"
      } ${ROW_TONES[tone]}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {!iconOnly && label}
    </button>
  );
}

function AddTenantModal({ onClose }) {
  const { refresh } = useTenant();
  const [tenantName, setTenantName] = useState("");
  const [creatingTenant, setCreatingTenant] = useState(false);

  const handleCreateTenant = async (event) => {
    event.preventDefault();
    const name = tenantName.trim();
    if (!name) {
      toast.error("Please enter a tenant name.");
      return;
    }

    setCreatingTenant(true);
    try {
      const response = await api.post("/tenants", { name });
      const tenant = response.data?.tenant ?? null;
      await refresh();
      toast.success(`Tenant "${tenant?.name ?? name}" created successfully.`);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not create the tenant. Please try again."
      );
    } finally {
      setCreatingTenant(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={creatingTenant ? undefined : onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tenant-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h3 id="add-tenant-title" className="text-sm font-bold text-slate-900 mb-0">
                Add A New Tenant
              </h3>
              <p className="text-[11px] text-slate-500 mb-0">
                Give the tenant a name to add it to the filter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={creatingTenant}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
              Tenant Name *
            </label>
            <input
              type="text"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              placeholder="Enter tenant name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            disabled={creatingTenant}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {creatingTenant ? "Creating Tenant..." : "Create Tenant"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default TenantSwitcher;
