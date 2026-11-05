import { useState, useEffect } from "react";
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../../context/api';

const filter_var = (value, type) => {
    if (type === 'FILTER_VALIDATE_BOOLEAN') {
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    return value;
};

function SystemSecurity() {
    const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(false);
    const [loginLockoutEnabled, setLoginLockoutEnabled] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSecuritySettings = async () => {
            try {
                setLoading(true);
                const response = await api.get("/admin/security/settings");
                const settings = response.data.settings;

                setAutoLogoutEnabled(filter_var(settings.auto_logout_enabled, 'FILTER_VALIDATE_BOOLEAN'));
                setLoginLockoutEnabled(filter_var(settings.login_lockout_enabled, 'FILTER_VALIDATE_BOOLEAN'));
            } catch (error) {
                console.error('Error fetching system security settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSecuritySettings();
    }, []);

    const updateSecuritySetting = async (key, value) => {
        try {
            await api.post("/admin/settings/update-single", { key, value });
            toast.success(`Setting for "${key}" updated successfully!`);
        } catch (error) {
            console.error('Error updating setting:', error);
            if (key === 'auto_logout_enabled') setAutoLogoutEnabled(!value);
            if (key === 'login_lockout_enabled') setLoginLockoutEnabled(!value);
        }
    };

    const handleAutoLogoutChange = (value) => {
        setAutoLogoutEnabled(value);
        updateSecuritySetting('auto_logout_enabled', value);
    };

    const handleLoginLockoutChange = (value) => {
        setLoginLockoutEnabled(value);
        updateSecuritySetting('login_lockout_enabled', value);
    };

    const handlePasswordReset = async (event) => {
        event.preventDefault();

        if (newPassword !== newPasswordConfirmation) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        try {
            await api.post("/admin/security/password-reset", {
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
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

    const ToggleSwitch = ({ enabled, setEnabled, label, description }) => (
        <div className="flex items-center justify-between py-2">
            <div>
                <span className="font-semibold text-slate-800 block text-xs">{label}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{description}</span>
            </div>
            <Switch
                checked={enabled}
                onChange={setEnabled}
                className={`${enabled ? 'bg-blue-600' : 'bg-slate-300'
                    } relative inline-flex items-center rounded-full transition-colors w-11 h-6 cursor-pointer shrink-0 ml-4`}
            >
                <span className="sr-only">Enable {label}</span>
                <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm`}
                />
            </Switch>
        </div>
    );

    if (loading) {
        return <div className="text-center py-12 text-slate-500 font-medium">Loading system security settings...</div>;
    }

    return (
        <div className="space-y-8 text-xs text-slate-700">
            {/* Session Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Session Management</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Auto-logout inactive users after a specified time.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Login Attempt Lockout</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Blocks brute-force login attacks.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Reset Password</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Change your password.
                    </p>
                </div>
                <div className="md:col-span-2 max-w-md">
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Enter New Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={newPasswordConfirmation}
                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                required
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-xs"
                            >
                                Reset Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SystemSecurity;