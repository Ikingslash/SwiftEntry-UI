import { useState, useEffect } from "react";
import api from "../../../context/api";

function UserRolePermission() {
  const [roles, setRoles] = useState([]);
  const [canonicalActions, setCanonicalActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/roles-with-permissions");
      setRoles(response.data.roles || []);
      setCanonicalActions(response.data.canonical_actions || []);
    } catch (err) {
      console.error("Error fetching roles and permissions:", err.response?.data || err.message);
      setError("Failed to load roles and permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (roleId, permissionName, isChecked) => {
    const updatedRoles = roles.map((role) => {
      if (role.id === roleId) {
        const newPermissions = isChecked
          ? [...role.permissions, permissionName]
          : role.permissions.filter((p) => p !== permissionName);
        return { ...role, permissions: newPermissions };
      }
      return role;
    });
    setRoles(updatedRoles);

    const roleToUpdate = updatedRoles.find((role) => role.id === roleId);
    if (!roleToUpdate) return;

    try {
      await api.post("/admin/roles/update-permissions", {
        role_id: roleId,
        permissions: roleToUpdate.permissions,
      });
      alert(`Permissions for ${roleToUpdate.name} updated successfully!`);
    } catch (err) {
      console.error("Error updating permissions:", err.response?.data || err.message);
      setError(
        "Failed to update permissions: " +
          (err.response?.data?.message ||
            JSON.stringify(err.response?.data?.errors) ||
            err.message)
      );
      fetchRolesAndPermissions();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-slate-500 text-xs font-medium mb-0">
          Loading user roles and permissions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
        <p className="text-rose-600 text-xs font-medium mb-0">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Left Section - Description */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 p-6">
          <h5 className="text-sm font-bold text-slate-900 mb-2">
            Define User Responsibilities
          </h5>
          <p className="text-xs text-slate-500 leading-relaxed mb-0">
            Define roles such as Admin, Staff, Frontdesk, and Security, and
            assign responsibilities based on their functions.
          </p>
        </div>
      </div>

      {/* Right Section - Permissions Table */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Actions</th>
                  {roles.map((role) => (
                    <th key={role.id} className="py-4 px-6 text-center whitespace-nowrap">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {canonicalActions.map((action, actionIndex) => (
                  <tr key={actionIndex} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600">{action}</td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${actionIndex}`} className="py-4 px-6 text-center">
                        <input
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          type="checkbox"
                          value=""
                          id={`checkbox-${role.id}-${actionIndex}`}
                          checked={role.permissions.includes(action)}
                          onChange={(e) =>
                            handlePermissionChange(role.id, action, e.target.checked)
                          }
                        />
                        <label
                          className="sr-only"
                          htmlFor={`checkbox-${role.id}-${actionIndex}`}
                        >
                          {action} for {role.name}
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRolePermission;
