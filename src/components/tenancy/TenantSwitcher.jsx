import { useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Layers, X } from "lucide-react";
import { toast } from "react-toastify";
import { useTenant } from "../../context/TenantContext";
import api from "../../context/api";
import { TENANT_STATUS } from "../../tenancy/constants";

const ADD_TENANT_VALUE = "__add_tenant__";

/**
 * Building-admin tenant filter.
 *
 * Not rendered for tenant users at all: their identity is fixed by the token,
 * so offering them a selector would be a lie.
 */
function TenantSwitcher({ className = "", light = false }) {
  const { isBuildingScope, tenants, viewingTenantId, setViewingTenant, loading } = useTenant();
  const [showAddTenant, setShowAddTenant] = useState(false);

  if (!isBuildingScope) return null;

  const base = light
    ? "border-white/20 bg-white/10 text-white"
    : "border-slate-200 bg-white text-slate-700";
  const labelTone = light ? "text-white/70" : "text-slate-400";
  const selectTone = light ? "text-white" : "text-slate-800";

  const handleFilterChange = (event) => {
    const value = event.target.value;
    if (value === ADD_TENANT_VALUE) {
      setShowAddTenant(true);
      return;
    }
    setViewingTenant(value || null);
  };

  return (
    <>
      <div className={`rounded-xl border ${base} px-3 py-2 ${className}`}>
        <label className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide ${labelTone}`}>
          {viewingTenantId ? <Building2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
          Tenant filter
        </label>
        <select
          value={viewingTenantId ?? ""}
          disabled={loading}
          onChange={handleFilterChange}
          className={`mt-1 w-full bg-transparent border-0 outline-none text-[11px] font-semibold ${selectTone} cursor-pointer disabled:opacity-60`}
          aria-label="Filter data by tenant"
        >
          <option value="" className="text-slate-900">
            All tenants
          </option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={String(tenant.id)} className="text-slate-900">
              {tenant.name}
              {tenant.status === TENANT_STATUS.SUSPENDED ? " (suspended)" : ""}
            </option>
          ))}
          <option value={ADD_TENANT_VALUE} className="text-blue-700 font-semibold">
            + Add a tenant
          </option>
        </select>
      </div>

      {showAddTenant && <AddTenantModal onClose={() => setShowAddTenant(false)} />}
    </>
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
