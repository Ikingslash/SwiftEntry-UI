import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import api from '../../../context/api';
import UserAvatar from '../../../components/UserAvatar';

function Profile() {
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

    const [companyProfile, setCompanyProfile] = useState({
        logo: '',
        companyName: '',
        companyEmail: ''
    });
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [previewCompanyLogo, setPreviewCompanyLogo] = useState(null);

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

    useEffect(() => {
        const fetchAllProfileData = async () => {
            try {
                const adminResponse = await api.get('/admin/profile');
                setAdminProfile(adminResponse.data.profile);

                const adminsResponse = await api.get('/admin/list-admins');
                setAdmins(adminsResponse.data.admins);

                const companyResponse = await api.get('/admin/settings/company');
                setCompanyProfile(companyResponse.data.company);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchAllProfileData();
    }, []);

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
            setAdminPhotoFile(null);
            setPreviewAdminPhoto(null);
        } catch (error) {
            console.error('Error updating admin profile:', error);
        }
    };

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
            setCompanyLogoFile(null);
            setPreviewCompanyLogo(null);
        } catch (error) {
            console.error('Error updating company profile:', error);
        }
    };

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
            await api.post('/admin/admins', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success('New admin added successfully! An invitation email has been sent.');
            setShowAddAdminModal(false);
            setNewAdmin({ fullName: '', email: '', jobRole: '', department: '', roleAssignment: '' });
            setNewAdminPhotoFile(null);
            setPreviewNewAdminPhoto(null);
            const adminsResponse = await api.get('/admin/list-admins');
            setAdmins(adminsResponse.data.admins);
        } catch (error) {
            console.error('Error adding new admin:', error);
            toast.error(error.response?.data?.message || 'Failed to add new admin.');
        }
    };

    return (
        <div className="space-y-8 text-xs text-slate-700">
            {/* Admin Profile Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Admin Profile</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Manage administrator credentials, profile photos, and role access.
                    </p>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 bg-white space-y-6">
                        {/* Admin Sub-Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeAdminTab === 'super-admin'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                onClick={() => setActiveAdminTab('super-admin')}
                            >
                                Super Admin
                            </button>
                            {admins.map((admin, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeAdminTab === admin.id
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    onClick={() => setActiveAdminTab(admin.id)}
                                >
                                    {admin.name}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        image={previewAdminPhoto || (adminProfile.photo ? `/storage/${adminProfile.photo}` : null)}
                                        firstName={adminProfile.fullName || "Admin"}
                                        size={64}
                                        className="rounded-full object-cover"
                                    />
                                    <div>
                                        <span className="font-semibold text-slate-800 block mb-1">Profile Picture</span>
                                        <input type="file" onChange={handleAdminPhotoChange} className="text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs self-start sm:self-center"
                                    onClick={() => setShowAddAdminModal(true)}
                                >
                                    + Add Admin
                                </button>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    name="fullName"
                                    value={adminProfile.fullName}
                                    onChange={handleAdminProfileChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    name="email"
                                    value={adminProfile.email}
                                    onChange={handleAdminProfileChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    name="phone"
                                    value={adminProfile.phone}
                                    onChange={handleAdminProfileChange}
                                />
                            </div>

                            <div className="pt-2 text-right">
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-xs">
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Company Profile Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Company Profile</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Update your organization name, support email, and company logo.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 bg-white">
                        <form onSubmit={handleUpdateCompanyProfile} className="space-y-4">
                            <div className="flex items-center gap-4 pb-2">
                                <img
                                    src={previewCompanyLogo || companyProfile.logo || "https://placehold.co/80x80/E0E7FF/000000?text=Company"}
                                    alt="Company Logo"
                                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                                />
                                <div>
                                    <span className="font-semibold text-slate-800 block mb-1">Company Logo</span>
                                    <input type="file" onChange={handleCompanyLogoChange} className="text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    name="companyName"
                                    value={companyProfile.companyName}
                                    onChange={handleCompanyProfileChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    name="companyEmail"
                                    value={companyProfile.companyEmail}
                                    onChange={handleCompanyProfileChange}
                                    required
                                />
                            </div>

                            <div className="pt-2 text-right">
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer text-xs">
                                    Update Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Add New Admin Slide-over / Modal */}
            {showAddAdminModal && (
                <div onClick={() => setShowAddAdminModal(false)} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm">Add New Admin</h3>
                            <button onClick={() => setShowAddAdminModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
                                <div className="text-center my-2">
                                    <UserAvatar
                                        image={previewNewAdminPhoto}
                                        firstName={newAdmin.fullName || "Admin"}
                                        size={80}
                                        className="mx-auto mb-2 rounded-full"
                                    />
                                    <label className="inline-block cursor-pointer">
                                        <span className="font-semibold text-blue-600 hover:underline">Add Photo</span>
                                        <input type="file" onChange={handleNewAdminPhotoChange} className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="fullName" value={newAdmin.fullName} onChange={handleNewAdminChange} required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="email" value={newAdmin.email} onChange={handleNewAdminChange} required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Job Role</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="jobRole" value={newAdmin.jobRole} onChange={handleNewAdminChange} required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="department" value={newAdmin.department} onChange={handleNewAdminChange} required />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Role Assignment</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" name="roleAssignment" value={newAdmin.roleAssignment} onChange={handleNewAdminChange} required />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer">
                                        Add Admin
                                    </button>
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