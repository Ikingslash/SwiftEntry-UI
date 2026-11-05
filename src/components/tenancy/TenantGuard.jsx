import { useTenant } from "../../context/TenantContext";
import Forbidden from "../../pages/Forbidden";

/**
 * Wrap a detail panel whose data carries a tenant id. If the loaded row belongs
 * to another tenant, the panel never renders its contents.
 */
function TenantGuard({
  tenantId,
  children,
  title = "This record belongs to another tenant",
  message = "The record exists, but it is outside your tenant scope.",
}) {
  const { canReach, isBuildingScope } = useTenant();

  if (tenantId == null) return children;
  if (isBuildingScope || canReach(tenantId)) return children;

  return <Forbidden title={title} message={message} reason={`Tenant ${tenantId} is not in your scope`} />;
}

export default TenantGuard;
