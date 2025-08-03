import { useState, useEffect, Fragment } from 'react';
import api from "../../../context/api";
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';

// A simple utility function to safely validate boolean values from the API
const filter_var = (value, type) => {
    if (type === 'FILTER_VALIDATE_BOOLEAN') {
        // Handle various boolean representations correctly
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    return value;
};

// The DataPrivacy component handles all data privacy-related settings
function DataPrivacy() {
    const [dataRetentionDays, setDataRetentionDays] = useState('30');
    const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
    const [notificationCleanupDays, setNotificationCleanupDays] = useState('30');
    const [totalVisitorsEnabled, setTotalVisitorsEnabled] = useState(false);
    const [peakVisitorHoursEnabled, setPeakVisitorHoursEnabled] = useState(false);
    const [visitorTypesEnabled, setVisitorTypesEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const retentionOptions = ['30', '60', '90', '180', '365'];

    // Function to fetch all data privacy settings
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

                toast.success('Data privacy settings loaded.');
            } catch (error) {
                console.error('Error fetching data privacy settings:', error);
                toast.error('Failed to load data privacy settings.');
            } finally {
                setLoading(false);
            }
        };

        fetchDataPrivacySettings();
    }, []);

    // New generic function to update a single setting
    const updateDataPrivacySetting = async (key, value) => {
        try {
            await api.post("/admin/data-privacy/update-single", { key, value });
            toast.success(`Setting for "${key}" updated successfully!`);
        } catch (error) {
            console.error('Error updating setting:', error);
            toast.error(`Failed to update setting: ${key}.`);
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

    // Function to handle data export
    // const handleExportData = async () => {
    //     try {
    //         const response = await api.get("/admin/data-export", {
    //             responseType: 'blob', // Important for downloading files
    //         });

    //         // Create a temporary URL to trigger the download
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', `data_export_${new Date().toISOString()}.json`);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.parentNode.removeChild(link);
    //         toast.success('Data export started successfully!');
    //     } catch (error) {
    //         console.error('Error exporting data:', error);
    //         toast.error('Failed to export data.');
    //     }
    // };

    // A reusable component for the toggle switches
    const ToggleSwitch = ({ enabled, setEnabled, label }) => (
        <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">{label}</span>
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

    // A reusable component for the select dropdowns
    const SelectField = ({ label, value, onChange, options }) => (
        <div className="d-flex justify-content-between align-items-center mt-5">
            <label className="text-muted mb-0">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="form-select w-50"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <p className="text-secondary">Loading settings...</p>
            </div>
        );
    }

    return (
        <Fragment>
            {/* Data Retention Policies Section */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <h5 className="fw-bold">Data Retention Policies</h5>
                    <p className="text-secondary small">
                        Set rules for how long visitor and system data are stored. Automate periodic data cleanup to maintain compliance.
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <div className="d-flex justify-content-between align-items-center pt-2">
                            <span className="text-muted">Automatic Data Clean Up</span>
                            <ToggleSwitch
                                enabled={autoDeleteEnabled}
                                setEnabled={handleRetentionToggleChange}
                                // label="Automatic Data Clean Up"
                            />
                        </div>
                        <hr />
                        <SelectField
                            label="Automatically delete visitor check-in records"
                            value={dataRetentionDays}
                            onChange={(e) => {
                                setDataRetentionDays(e.target.value);
                                updateDataPrivacySetting('data_retention_days', e.target.value);
                            }}
                            options={retentionOptions.map(days => ({ value: days, label: `After ${days} Days` }))}
                        />
                        <SelectField
                            label="Notification Clean Up"
                            value={notificationCleanupDays}
                            onChange={(e) => {
                                setNotificationCleanupDays(e.target.value);
                                updateDataPrivacySetting('notification_cleanup_days', e.target.value);
                            }}
                            options={retentionOptions.map(days => ({ value: days, label: `After ${days} Days` }))}
                        />
                    </div>
                </div>
            </div>

            {/* Report Customization Section */}
            <div className="row g-4 mb-5 pb-5">
                <div className="col-md-4">
                    <h5 className="fw-bold">Report Customization</h5>
                    <p className="text-secondary small">
                        Configure automated exports and report settings.
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <div className="d-flex justify-content-between align-items-center py-2">
                            <span className="text-muted">Total Visitors Per Day/Week/Month</span>
                            <ToggleSwitch
                                enabled={totalVisitorsEnabled}
                                setEnabled={(value) => handleReportToggleChange('total_visitors_enabled', value)}
                                // label="Total Visitors Per Day/Week/Month"
                            />
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Peak Visitor Hours</span>
                            <ToggleSwitch
                                enabled={peakVisitorHoursEnabled}
                                setEnabled={(value) => handleReportToggleChange('peak_visitor_hours_enabled', value)}
                                // label="Peak Visitor Hours"
                            />
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Visitor Types</span>
                            <ToggleSwitch
                                enabled={visitorTypesEnabled}
                                setEnabled={(value) => handleReportToggleChange('visitor_types_enabled', value)}
                                // label="Visitor Types"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Export Button */}
            {/* <div className="row g-4">
                <div className="col-md-4">
                    <h5 className="fw-bold">Data Export</h5>
                    <p className="text-secondary small">
                        Download a full backup of all visitor and visit data in JSON format.
                    </p>
                </div>
                <div className="col-md-8">
                    <button
                        onClick={handleExportData}
                        className="btn btn-primary w-100"
                    >
                        Export All Visitor Data
                    </button>
                </div>
            </div> */}
        </Fragment>
    );
}

export default DataPrivacy;
