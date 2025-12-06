import React, { useState, useEffect, Fragment } from "react";
import { toast } from 'react-toastify';
import api from '../../../context/api';

function Profile() {
    // State for the Admin Profile
    const [activeAdminTab, setActiveAdminTab] = useState('super-admin');
    const [adminProfile, setAdminProfile] = useState({
        photo: '',
        fullName: '',
        email: '',
        phone: ''
    });
    const [admins, setAdmins] = useState([]);
    const [adminPhotoFile, setAdminPhotoFile] = useState(null);
    const [previewAdminPhoto, setPreviewAdminPhoto] = useState(null);

    // State for the Company Profile
    const [companyProfile, setCompanyProfile] = useState({
        logo: '',
        companyName: '',
        companyEmail: ''
    });
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [previewCompanyLogo, setPreviewCompanyLogo] = useState(null);

    // State for the "Add New Admin" modal
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        fullName: '',
        email: '',
        jobRole: '',
        department: '',
        roleAssignment: ''
    });
    const [newAdminPhotoFile, setNewAdminPhotoFile] = useState(null);
    const [previewNewAdminPhoto, setPreviewNewAdminPhoto] = useState(null);


    // Fetch all initial data on component mount
    useEffect(() => {
        const fetchAllProfileData = async () => {
            try {
                // Fetch current admin's profile
                const adminResponse = await api.get('/admin/profile');
                setAdminProfile(adminResponse.data.profile);

                // Fetch list of admins (for the tabs)
                const adminsResponse = await api.get('/admin/list-admins');
                setAdmins(adminsResponse.data.admins);

                // Fetch company details
                const companyResponse = await api.get('/admin/settings/company');
                setCompanyProfile(companyResponse.data.company);

                // toast.success('Profile and company data loaded.');
            } catch (error) {
                console.error('Error fetching profile data:', error);
                // toast.error('Failed to load profile data.');
            }
        };

        fetchAllProfileData();
    }, []);

    // Handlers for Admin Profile
    const handleAdminProfileChange = (e) => {
        const { name, value } = e.target;
        setAdminProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAdminPhotoChange = (e) => {
        const file = e.target.files[0];
        setAdminPhotoFile(file);
        if (file) {
            setPreviewAdminPhoto(URL.createObjectURL(file));
        } else {
            setPreviewAdminPhoto(null);
        }
    };

    const handleUpdateAdminProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullName', adminProfile.fullName);
        formData.append('email', adminProfile.email);
        formData.append('phone', adminProfile.phone);
        if (adminPhotoFile) {
            formData.append('photo', adminPhotoFile);
        }

        try {
            await api.post('/admin/settings/profile', formData, {
                 headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT'
                }
            });
            toast.success('Admin profile updated successfully!');
            // Reset photo state
            setAdminPhotoFile(null);
            setPreviewAdminPhoto(null);
        } catch (error) {
            console.error('Error updating admin profile:', error);
            // toast.error('Failed to update admin profile.');
        }
    };

    // Handlers for Company Profile
    const handleCompanyProfileChange = (e) => {
        const { name, value } = e.target;
        setCompanyProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyLogoChange = (e) => {
        const file = e.target.files[0];
        setCompanyLogoFile(file);
        if (file) {
            setPreviewCompanyLogo(URL.createObjectURL(file));
        } else {
            setPreviewCompanyLogo(null);
        }
    };

    const handleUpdateCompanyProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('companyName', companyProfile.companyName);
        formData.append('companyEmail', companyProfile.companyEmail);
        if (companyLogoFile) {
            formData.append('logo', companyLogoFile);
        }

        try {
            await api.post('/admin/settings/company', formData, {
                 headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT'
                }
            });
            toast.success('Company details updated successfully!');
            // Reset logo state
            setCompanyLogoFile(null);
            setPreviewCompanyLogo(null);
        } catch (error) {
            console.error('Error updating company profile:', error);
            // toast.error('Failed to update company details.');
        }
    };

    // Handlers for Add New Admin Modal
    const handleNewAdminChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({ ...prev, [name]: value }));
    };

    const handleNewAdminPhotoChange = (e) => {
        const file = e.target.files[0];
        setNewAdminPhotoFile(file);
        if (file) {
            setPreviewNewAdminPhoto(URL.createObjectURL(file));
        } else {
            setPreviewNewAdminPhoto(null);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullName', newAdmin.fullName);
        formData.append('email', newAdmin.email);
        formData.append('jobRole', newAdmin.jobRole);
        formData.append('department', newAdmin.department);
        formData.append('roleAssignment', newAdmin.roleAssignment);
        if (newAdminPhotoFile) {
            formData.append('photo', newAdminPhotoFile);
        }

        try {
            await api.post('/admin/settings/admins', formData, {
                 headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success('New admin added successfully!');
            setShowAddAdminModal(false);
            setNewAdmin({ fullName: '', email: '', jobRole: '', department: '', roleAssignment: '' });
            setNewAdminPhotoFile(null);
            setPreviewNewAdminPhoto(null);
            // Re-fetch the list of admins to update the tabs
            const adminsResponse = await api.get('/admin/list-admins');
            setAdmins(adminsResponse.data.admins);
        } catch (error) {
            console.error('Error adding new admin:', error);
            // toast.error('Failed to add new admin.');
        }
    };

    return (
        <div className="container">
            {/* Admin Profile Section */}
            <div className="row g-4 mb-5">
                <div className="col-md-12">
                    <h5 className="fw-bold">Admin Profile</h5>
                </div>
                <div className="col-md-12">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        {/* Admin Tabs */}
                        <ul className="nav nav-pills mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeAdminTab === 'super-admin' ? 'active' : ''}`}
                                    onClick={() => setActiveAdminTab('super-admin')}
                                >
                                    Super Admin
                                </button>
                            </li>
                            {admins.map((admin, index) => (
                                <li className="nav-item" key={index}>
                                    <button
                                        className={`nav-link ${activeAdminTab === admin.id ? 'active' : ''}`}
                                        onClick={() => setActiveAdminTab(admin.id)}
                                    >
                                        {admin.name}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Admin Profile Form */}
                        <form onSubmit={handleUpdateAdminProfile}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={previewAdminPhoto || (adminProfile.photo ? `/storage/${adminProfile.photo}` : "https://placehold.co/80x80/E0E7FF/000000?text=Admin")}
                                        alt="Admin"
                                        className="rounded-circle me-3"
                                        width="80"
                                        height="80"
                                    />
                                    <div>
                                        <p className="fw-bold mb-0">Profile Picture</p>
                                        <input type="file" onChange={handleAdminPhotoChange} className="form-control-file" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowAddAdminModal(true)}
                                >
                                    Add Admin
                                </button>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fullName"
                                    value={adminProfile.fullName}
                                    onChange={handleAdminProfileChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={adminProfile.email}
                                    onChange={handleAdminProfileChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="phone"
                                    value={adminProfile.phone}
                                    onChange={handleAdminProfileChange}
                                />
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-primary">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Company Profile Section */}
            <div className="row g-4 mb-5 pb-5">
                <div className="col-md-12">
                    <h5 className="fw-bold">Company Profile</h5>
                </div>
                <div className="col-md-12">
                    <div className="card shadow-sm p-4 rounded-4 border-0">
                        <form onSubmit={handleUpdateCompanyProfile}>
                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={previewCompanyLogo || companyProfile.logo || "https://placehold.co/80x80/E0E7FF/000000?text=Company"}
                                        alt="Company Logo"
                                        className="me-3"
                                        width="80"
                                        height="80"
                                    />
                                    <div>
                                        <p className="fw-bold mb-0">Company Logo</p>
                                        <input type="file" onChange={handleCompanyLogoChange} className="form-control-file" />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="companyName"
                                    value={companyProfile.companyName}
                                    onChange={handleCompanyProfileChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Company Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="companyEmail"
                                    value={companyProfile.companyEmail}
                                    onChange={handleCompanyProfileChange}
                                    required
                                />
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-primary">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Add New Admin Modal */}
            {showAddAdminModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleAddAdmin}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Admin</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddAdminModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-3">
                                        <img
                                            src={previewNewAdminPhoto || "https://placehold.co/80x80/E0E7FF/000000?text=Admin"}
                                            alt="Admin Photo"
                                            className="rounded-circle mb-3"
                                            width="80"
                                            height="80"
                                        />
                                        <p className="small text-secondary">Add Photo</p>
                                        <input type="file" onChange={handleNewAdminPhotoChange} className="form-control-file" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" name="fullName" value={newAdmin.fullName} onChange={handleNewAdminChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-control" name="email" value={newAdmin.email} onChange={handleNewAdminChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Job Role</label>
                                        <input type="text" className="form-control" name="jobRole" value={newAdmin.jobRole} onChange={handleNewAdminChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department</label>
                                        <input type="text" className="form-control" name="department" value={newAdmin.department} onChange={handleNewAdminChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Role Assignment</label>
                                        <input type="text" className="form-control" name="roleAssignment" value={newAdmin.roleAssignment} onChange={handleNewAdminChange} required />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary w-100">Add</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
