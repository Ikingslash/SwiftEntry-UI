import { useState, useEffect } from "react";
import api from "../../../context/api";
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';

function Notification() {
  const [preferences, setPreferences] = useState({
    new_guest_checkins: false,
    vip_guest_arrivals: false,
    blacklisted_guest_attempts: false,
    missed_or_canceled_visits: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/settings");
      setPreferences(response.data.notification_preferences);
    } catch (err) {
      console.error("Error fetching notification preferences:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (key) => {
    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));

    try {
      await api.post("/admin/settings/update", {
        key: `notification_${key}`,
        value: newValue,
      });
      toast.success(`Notification for '${key}' updated successfully!`);
    } catch (err) {
      console.error(`Error updating notification preference '${key}':`, err.response?.data || err.message);
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={`${enabled ? 'bg-blue-600' : 'bg-slate-300'
        } relative inline-flex items-center rounded-full transition-colors w-11 h-6 cursor-pointer`}
    >
      <span className="sr-only">Enable {label}</span>
      <span
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm`}
      />
    </Switch>
  );

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-medium">Loading notification preferences...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-rose-600 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8 text-xs text-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Alert Preferences</h4>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Set up automated alerts and notifications to keep all users informed in real time.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
            <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="font-semibold text-slate-800">New guest check-ins or check-outs</span>
              <ToggleSwitch
                enabled={preferences.new_guest_checkins}
                setEnabled={() => handleToggleChange('new_guest_checkins')}
                label="New guest check-ins or check-outs"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="font-semibold text-slate-800">VIP guest arrivals</span>
              <ToggleSwitch
                enabled={preferences.vip_guest_arrivals}
                setEnabled={() => handleToggleChange('vip_guest_arrivals')}
                label="VIP guest arrivals"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="font-semibold text-slate-800">Blacklisted guest attempts</span>
              <ToggleSwitch
                enabled={preferences.blacklisted_guest_attempts}
                setEnabled={() => handleToggleChange('blacklisted_guest_attempts')}
                label="Blacklisted guest attempts"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="font-semibold text-slate-800">Missed or canceled visits</span>
              <ToggleSwitch
                enabled={preferences.missed_or_canceled_visits}
                setEnabled={() => handleToggleChange('missed_or_canceled_visits')}
                label="Missed or canceled visits"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notification;