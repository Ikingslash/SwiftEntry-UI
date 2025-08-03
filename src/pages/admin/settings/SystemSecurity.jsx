import React, { useState, useEffect, Fragment } from "react";
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../../context/api';

// A simple utility function to safely validate boolean values from the API
const filter_var = (value, type) => {
    if (type === 'FILTER_VALIDATE_BOOLEAN') {
        // Handle various boolean representations correctly
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    return value;
};

function SystemSecurity() {
    // State for the security settings
    const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(false);
    const [loginLockoutEnabled, setLoginLockoutEnabled] = useState(false);
    
    // State for password reset form
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch initial security settings
    useEffect(() => {
        const fetchSecuritySettings = async () => {
            try {
                setLoading(true);
                // Assuming a new API endpoint for fetching system security settings
                const response = await api.get("/admin/security/settings");
                const settings = response.data.settings;

                // Set the state based on the fetched values
                setAutoLogoutEnabled(filter_var(settings.auto_logout_enabled, 'FILTER_VALIDATE_BOOLEAN'));
                setLoginLockoutEnabled(filter_var(settings.login_lockout_enabled, 'FILTER_VALIDATE_BOOLEAN'));

                toast.success('System security settings loaded.');
            } catch (error) {
                console.error('Error fetching system security settings:', error);
                toast.error('Failed to load system security settings.');
            } finally {
                setLoading(false);
            }
        };

        fetchSecuritySettings();
    }, []);

    // Function to update a single security setting instantly on toggle
    const updateSecuritySetting = async (key, value) => {
        try {
            await api.post("/admin/settings/update-single", { key, value });
            toast.success(`Setting for "${key}" updated successfully!`);
        } catch (error) {
            console.error('Error updating setting:', error);
            // Revert the state on error for better user experience
            if (key === 'auto_logout_enabled') setAutoLogoutEnabled(!value);
            if (key === 'login_lockout_enabled') setLoginLockoutEnabled(!value);
            toast.error(`Failed to update setting: ${key}.`);
        }
    };

    // Handler for the auto-logout switch
    const handleAutoLogoutChange = (value) => {
        setAutoLogoutEnabled(value);
        updateSecuritySetting('auto_logout_enabled', value);
    };

    // Handler for the login lockout switch
    const handleLoginLockoutChange = (value) => {
        setLoginLockoutEnabled(value);
        updateSecuritySetting('login_lockout_enabled', value);
    };

    // Handler for the password reset form submission
    const handlePasswordReset = async (event) => {
        event.preventDefault();
        
        if (newPassword !== newPasswordConfirmation) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        try {
            await api.post("/admin/security/password-reset", {
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation, // Corrected field name
            });
            toast.success("Password reset successfully!");
            setNewPassword('');
            setNewPasswordConfirmation('');
        } catch (error) {
            console.error('Error resetting password:', error);
            const errorMessage = error.response?.data?.message || 'Failed to reset password.';
            toast.error(errorMessage);
        }
    };

    // Reusable ToggleSwitch component
    const ToggleSwitch = ({ enabled, setEnabled, label, description }) => (
        <div className="d-flex justify-content-between align-items-center py-2">
            <div>
                <span className="fw-bold d-block">{label}</span>
                <small className="text-secondary">{description}</small>
            </div>
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
        </div>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <p className="text-secondary">Loading system security settings...</p>
            </div>
        );
    }

    return (
        <Fragment>
            {/* Session Management */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <h5 className="fw-bold">Session Management</h5>
                    <p className="text-secondary small">
                        Auto-logout inactive users after a specified time.
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <ToggleSwitch
                            enabled={autoLogoutEnabled}
                            setEnabled={handleAutoLogoutChange}
                            label="Auto-logout inactive users"
                            description="Automatically log out users who are inactive for a specified time."
                        />
                    </div>
                </div>
            </div>

            {/* Login Attempt Lockout */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <h5 className="fw-bold">Login Attempt Lockout</h5>
                    <p className="text-secondary small">
                        Blocks brute-force login attacks.
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <ToggleSwitch
                            enabled={loginLockoutEnabled}
                            setEnabled={handleLoginLockoutChange}
                            label="Automatically lock a user account"
                            description="Lock a user account after several failed login attempts."
                        />
                    </div>
                </div>
            </div>

            {/* Reset Password */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <h5 className="fw-bold">Reset Password</h5>
                    <p className="text-secondary small">
                        Change your password.
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <form onSubmit={handlePasswordReset}>
                            <div className="mb-3">
                                <label className="form-label">Enter New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPasswordConfirmation}
                                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-primary">
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default SystemSecurity;
