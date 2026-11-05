import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../context/api";
import { useAuth } from "../../context/AuthContext";
import FrontDeskTopHeader from "./include/FrontDeskTopHeader";

function FrontDeskSettings() {
  const [settings, setSettings] = useState({
    notificationEmail: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get("front-desk/frontdesk_setting");
        if (response.data) {
          setSettings({
            notificationEmail: response.data.email || "",
            password: "",
            password_confirmation: "",
          });
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
        notification_email: settings.notificationEmail,
      };

      if (settings.password && settings.password_confirmation) {
        payload.password = settings.password;
        payload.password_confirmation = settings.password_confirmation;
      }

      await api.post("front-desk/frontdesk_setting", payload);
      toast.success("Settings updated successfully");
      setSettings((prev) => ({ ...prev, password: "", password_confirmation: "" }));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error("Failed to update settings");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7fc] pb-12">
      <FrontDeskTopHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-0">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account settings</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-0">Account Settings</h3>
              <p className="text-slate-500 text-xs mt-1">Update your notification preferences and password</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="notificationEmail" className="block text-xs font-semibold text-slate-700 mb-2">
                  Notification Email
                </label>
                <input
                  type="email"
                  id="notificationEmail"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter notification email"
                  value={settings.notificationEmail}
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
                  placeholder="Re-enter new password"
                  value={settings.password_confirmation}
                  onChange={handleChange}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
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

export default FrontDeskSettings;
