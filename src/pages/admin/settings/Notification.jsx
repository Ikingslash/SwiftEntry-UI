import React, { useState, useEffect } from "react";
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
      // Access the notification_preferences object from the response
      setPreferences(response.data.notification_preferences);
      toast.success("Notification preferences loaded successfully!");
    } catch (err) {
      console.error("Error fetching notification preferences:", err.response?.data || err.message);
       toast.error("Failed to load notification preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (key) => {
    const newValue = !preferences[key]; // Toggle the boolean value
    setPreferences(prev => ({ ...prev, [key]: newValue })); // Optimistic update

    try {
      await api.post("/admin/settings/update", {
        key: `notification_${key}`, // Match the backend key format
        value: newValue, // Send boolean, backend will convert to 'true'/'false' string
      });
      console.log(`Notification preference '${key}' updated to ${newValue}`);
       toast.success(`Notification for '${key}' updated successfully!`);
      // No need to re-fetch if optimistic update is reliable
    } catch (err) {
      console.error(`Error updating notification preference '${key}':`, err.response?.data || err.message); 
       toast.error(`Failed to update preference: ` + (err.response?.data?.message || err.message));
      
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
    }
  };

    const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
            enabled ? 'bg-primary' : 'bg-secondary'
        } position-relative d-inline-flex align-items-center rounded-pill transition-colors`}
        style={{ width: '44px', height: '24px' }}
    >
        <span className="visually-hidden">Enable {label}</span>
        <span
            className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
            } d-inline-block h-4 w-4 rounded-circle bg-white shadow-sm transition-transform`}
            style={{ transform: `translateX(${enabled ? '20px' : '4px'})`, width: '16px', height: '16px' }}
        />
    </Switch>
  );


  if (loading) {
    return <p className="text-center mt-5">Loading notification preferences...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <div className="row mb-5">
      {/* Left Section - Description */}
      <div className="col-md-4">
        <div className="p-3">
          <h5 className="mb-3">Alert Preferences</h5>
          <p>
            <small>
              Set up automated alerts and notifications to keep all users
              informed in real time.
            </small>
          </p>
        </div>
      </div>

      {/* Right Section - Notification Toggles */}
      <div className="col-md-8">
        <div className="card shadow-sm p-4 rounded-4 border-0">
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <span>New guest check-ins or check-outs</span>
              <ToggleSwitch
                enabled={preferences.new_guest_checkins}
                setEnabled={() => handleToggleChange('new_guest_checkins')}
                label="New guest check-ins or check-outs"
              />
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <span>VIP guest arrivals</span>
              <ToggleSwitch
                enabled={preferences.vip_guest_arrivals}
                setEnabled={() => handleToggleChange('vip_guest_arrivals')}
                label="VIP guest arrivals"
              />
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <span>Blacklisted guest attempts</span>
              <ToggleSwitch
                enabled={preferences.blacklisted_guest_attempts}
                setEnabled={() => handleToggleChange('blacklisted_guest_attempts')}
                label="Blacklisted guest attempts"
              />
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <span>Missed or canceled visits</span>
              <ToggleSwitch
                enabled={preferences.missed_or_canceled_visits}
                setEnabled={() => handleToggleChange('missed_or_canceled_visits')}
                label="Missed or canceled visits"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Notification;
