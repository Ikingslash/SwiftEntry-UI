import { useState, useEffect } from 'react';
import api from "../../../context/api";
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';

const filter_var = (value, type) => {
    if (type === 'FILTER_VALIDATE_BOOLEAN') {
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    return value;
};

function DataPrivacy() {
    const [dataRetentionDays, setDataRetentionDays] = useState('30');
    const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
    const [notificationCleanupDays, setNotificationCleanupDays] = useState('30');
    const [totalVisitorsEnabled, setTotalVisitorsEnabled] = useState(false);
    const [peakVisitorHoursEnabled, setPeakVisitorHoursEnabled] = useState(false);
    const [visitorTypesEnabled, setVisitorTypesEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const retentionOptions = ['30', '60', '90', '180', '365'];

    useEffect(() => {
        const fetchDataPrivacySettings = async () => {
            try {
                setLoading(true);
                const response = await api.get("/admin/data-privacy");
                const settings = response.data;

                setDataRetentionDays(String(settings.data_retention_days) || '30');
                setAutoDeleteEnabled(filter_var(settings.data_retention_auto_delete, 'FILTER_VALIDATE_BOOLEAN'));
                setNotificationCleanupDays(String(settings.notification_cleanup_days) || '30');
                setTotalVisitorsEnabled(filter_var(settings.total_visitors_enabled, 'FILTER_VALIDATE_BOOLEAN'));
                setPeakVisitorHoursEnabled(filter_var(settings.peak_visitor_hours_enabled, 'FILTER_VALIDATE_BOOLEAN'));
                setVisitorTypesEnabled(filter_var(settings.visitor_types_enabled, 'FILTER_VALIDATE_BOOLEAN'));
            } catch (error) {
                console.error('Error fetching data privacy settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataPrivacySettings();
    }, []);

    const updateDataPrivacySetting = async (key, value) => {
        try {
            await api.post("/admin/data-privacy/update-single", { key, value });
            toast.success(`Setting for "${key}" updated successfully!`);
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    };

    const handleRetentionToggleChange = (value) => {
        setAutoDeleteEnabled(value);
        updateDataPrivacySetting('data_retention_auto_delete', value);
    };

    const handleReportToggleChange = (key, value) => {
        if (key === 'total_visitors_enabled') {
            setTotalVisitorsEnabled(value);
        } else if (key === 'peak_visitor_hours_enabled') {
            setPeakVisitorHoursEnabled(value);
        } else if (key === 'visitor_types_enabled') {
            setVisitorTypesEnabled(value);
        }
        updateDataPrivacySetting(key, value);
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
        return <div className="text-center py-12 text-slate-500 font-medium">Loading settings...</div>;
    }

    return (
        <div className="space-y-8 text-xs text-slate-700">
            {/* Data Retention Policies Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Data Retention Policies</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Set rules for how long visitor and system data are stored. Automate periodic data cleanup to maintain compliance.
                    </p>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">Automatic Data Clean Up</span>
                            <ToggleSwitch
                                enabled={autoDeleteEnabled}
                                setEnabled={handleRetentionToggleChange}
                                label="Automatic Data Clean Up"
                            />
                        </div>
                        <hr className="border-slate-100" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="font-semibold text-slate-800">Automatically delete visitor check-in records</span>
                            <select
                                value={dataRetentionDays}
                                onChange={(e) => {
                                    setDataRetentionDays(e.target.value);
                                    updateDataPrivacySetting('data_retention_days', e.target.value);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:w-48"
                            >
                                {retentionOptions.map(days => (
                                    <option key={days} value={days}>After {days} Days</option>
                                ))}
                            </select>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="font-semibold text-slate-800">Notification Clean Up</span>
                            <select
                                value={notificationCleanupDays}
                                onChange={(e) => {
                                    setNotificationCleanupDays(e.target.value);
                                    updateDataPrivacySetting('notification_cleanup_days', e.target.value);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:w-48"
                            >
                                {retentionOptions.map(days => (
                                    <option key={days} value={days}>After {days} Days</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Customization Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Report Customization</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Configure automated exports and report settings.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                        <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                            <span className="font-semibold text-slate-800">Total Visitors Per Day/Week/Month</span>
                            <ToggleSwitch
                                enabled={totalVisitorsEnabled}
                                setEnabled={(value) => handleReportToggleChange('total_visitors_enabled', value)}
                                label="Total Visitors Per Day/Week/Month"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                            <span className="font-semibold text-slate-800">Peak Visitor Hours</span>
                            <ToggleSwitch
                                enabled={peakVisitorHoursEnabled}
                                setEnabled={(value) => handleReportToggleChange('peak_visitor_hours_enabled', value)}
                                label="Peak Visitor Hours"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                            <span className="font-semibold text-slate-800">Visitor Types</span>
                            <ToggleSwitch
                                enabled={visitorTypesEnabled}
                                setEnabled={(value) => handleReportToggleChange('visitor_types_enabled', value)}
                                label="Visitor Types"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataPrivacy;