import { Filter, X } from "lucide-react";
import { useTenant } from "../../context/TenantContext";

/**
 * Shown whenever a building admin is looking through a tenant filter.
 * Without it, a filtered dashboard can be mistaken for "everything".
 */
function ScopeBanner({ className = "" }) {
  const { viewingTenant, viewingTenantId, clearViewingTenant } = useTenant();

  if (!viewingTenantId) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-semibold text-amber-800 ${className}`}
      role="status"
    >
      <Filter className="w-3.5 h-3.5" />
      <span>
        Filtered to <strong>{viewingTenant?.name ?? `tenant ${viewingTenantId}`}</strong>. Other
        tenants are hidden from lists and dashboards.
      </span>
      <button
        type="button"
        onClick={clearViewingTenant}
        className="ml-auto inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white/70 px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-white cursor-pointer transition-colors"
      >
        <X className="w-3 h-3" />
        Clear filter
      </button>
    </div>
  );
}

export default ScopeBanner;
