import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../context/api";
import StaffTopHeader from "./include/StaffTopHeader";

function StaffSettings() {
  const [settings, setSettings] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get("staff/settings");
        if (response.data && response.data.email) {
          setSettings((prev) => ({
            ...prev,
            email: response.data.email,
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch settings");
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: settings.email,
      };

      if (settings.password) {
        if (settings.password !== settings.password_confirmation) {
          toast.error("Passwords do not match.");
          return;
        }
        payload.password = settings.password;
        payload.password_confirmation = settings.password_confirmation;
      }

      await api.post("staff/settings", payload);
      toast.success("Settings updated successfully");
      setSettings((prev) => ({ ...prev, password: "", password_confirmation: "" }));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to update settings");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-12">
      <StaffTopHeader />

      {/* Header Container */}
      <div className="max-w-[1140px] mx-auto px-4 pt-8 pb-4">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-0">
          Staff Settings
        </p>
        <p className="text-slate-500 text-xs font-medium mb-0 mt-1">
          Manage your account email and password.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4">
        <div className="max-w-2xl">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-0">Account Settings</h3>
              <p className="text-slate-500 text-xs mt-1">
                Update your login credentials and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter new email"
                  value={settings.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-2">
                  Change Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter new password"
                  value={settings.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-xs font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Confirm new password"
                  value={settings.password_confirmation}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer border-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffSettings;
