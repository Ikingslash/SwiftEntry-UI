import React, { useState, useEffect } from "react";
import api from "../../../context/api"; // Assuming your Axios instance

function UserRolePermission() {
  const [roles, setRoles] = useState([]);
  const [canonicalActions, setCanonicalActions] = useState([]); // Ordered list of permissions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/roles-with-permissions"); // New endpoint
      setRoles(response.data.roles);
      setCanonicalActions(response.data.canonical_actions);
    } catch (err) {
      console.error("Error fetching roles and permissions:", err.response?.data || err.message);
      setError("Failed to load roles and permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (roleId, permissionName, isChecked) => {
    // Optimistically update UI
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

    // Prepare payload for backend
    const roleToUpdate = updatedRoles.find(role => role.id === roleId);
    if (!roleToUpdate) return; // Should not happen

    try {
      await api.post("/admin/roles/update-permissions", { // New endpoint
        role_id: roleId,
        permissions: roleToUpdate.permissions,
      });
      alert(`Permissions for ${roleToUpdate.name} updated successfully!`);
    } catch (err) {
      console.error("Error updating permissions:", err.response?.data || err.message);
      setError("Failed to update permissions: " + (err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || err.message));
      // Revert UI on error
      fetchRolesAndPermissions();
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading user roles and permissions...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <div className="row mb-5">
      {/* Left Section - Description */}
      <div className="col-md-4">
        <div className="p-3">
          <h5 className="mb-3">Define User Responsibilities</h5>
          <p>
            <small>
              Define roles such as Admin, Staff, Frontdesk, and Security, and
              assign responsibilities based on their functions.
            </small>
          </p>
        </div>
      </div>

      {/* Right Section - Permissions Table */}
      <div className="col-md-8">
        <div className="card shadow-sm p-4 rounded-4 border-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="bg-light">
                <tr>
                  <th className="text-nowrap">Actions</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center text-nowrap">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {canonicalActions.map((action, actionIndex) => (
                  <tr key={actionIndex}>
                    <td className="text-nowrap">{action}</td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${actionIndex}`} className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id={`checkbox-${role.id}-${actionIndex}`}
                            checked={role.permissions.includes(action)}
                            onChange={(e) =>
                              handlePermissionChange(
                                role.id,
                                action,
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className="form-check-label visually-hidden"
                            htmlFor={`checkbox-${role.id}-${actionIndex}`}
                          >
                            {action} for {role.name}
                          </label>
                        </div>
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
