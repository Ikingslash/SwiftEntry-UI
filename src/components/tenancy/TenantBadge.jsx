import { Building2, Layers } from "lucide-react";
import { useTenant } from "../../context/TenantContext";

/**
 * Small identity chip. It shows *where you are*, so nobody mistakes a filtered
 * tenant view for the whole building.
 */
function TenantBadge({ className = "", compact = false }) {
  const { activeTenant, isBuildingScope, viewingTenant } = useTenant();

  const label = activeTenant?.name ?? (isBuildingScope ? "All tenants" : "Tenant");
  const Icon = activeTenant ? Building2 : Layers;
  const contextLabel = viewingTenant
    ? "Viewing tenant"
    : isBuildingScope
      ? "Building-wide"
      : "Tenant workspace";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 ${className}`}
      title={contextLabel}
    >
      <span className="w-6 h-6 rounded-full bg-[#e8f2ff] text-[#0b63b6] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="text-[11px] font-bold text-slate-900 truncate max-w-40">{label}</span>
        {!compact && (
          <span className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">
            {contextLabel}
          </span>
        )}
      </span>
    </div>
  );
}

export default TenantBadge;
