import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
    Eye,
    EyeOff,
    ShieldCheck,
    Users,
    TrendingUp,
    Mail,
    Lock,
    User,
    Building,
    Loader2
} from "lucide-react";

import api from "../context/api";
import FrontdeskImage from "../assets/frontdesk.png";
import SwiftEntryLogo from "/pwa-512x512.png";

function AdminRegister() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        department: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            toast.error("reCAPTCHA not ready. Please try again.");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsSubmitting(true);

        try {
            const recaptchaToken = await executeRecaptcha('admin_register');

            const response = await api.post('/admin/register', {
                ...formData,
                recaptcha_token: recaptchaToken,
            });

            if (response.status === 201) {
                toast.success("Registration successful! Please sign in.");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((messages) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(msg));
                    } else {
                        toast.error(messages);
                    }
                });
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [executeRecaptcha, formData, navigate]);

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <div className="w-full h-dvh bg-[#edf5ff] flex items-center justify-center p-0 m-0 overflow-hidden font-sans">

                {/* Main Full-Screen 50/50 Split View */}
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">

                    {/* LEFT SIDE: Brand Image Panel with Gradient & Features */}
                    <aside className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative flex-col justify-between p-8 xl:p-10 bg-[#02213d] text-white overflow-hidden h-full">

                        {/* Zoomed-Out Image Pushed to the Right */}
                        <div className="absolute inset-y-0 right-0 w-[70%] h-full pointer-events-none select-none flex items-center justify-end">
                            <img
                                src={FrontdeskImage}
                                alt="Frontdesk Portal"
                                className="w-full h-full object-cover object-right opacity-80"
                            />
                        </div>

                        {/* Darker Gradient Overlay for High Text Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#02213d] via-[#02213d]/95 to-transparent w-[85%] z-10 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02213d]/95 via-transparent to-transparent z-10 pointer-events-none" />

                        {/* Top Branding Header Aligned Left */}
                        <div className="relative z-20 flex flex-col items-start gap-1">
                            <div className="flex items-center -ml-2">
                                <img
                                    src={SwiftEntryLogo}
                                    alt="SwiftEntry"
                                    className="h-20 w-auto object-contain brightness-0 invert"
                                />
                            </div>
                            <p className="text-xs font-medium text-white/80 tracking-wide">
                                Smarter Access. Safer Spaces.
                            </p>
                        </div>

                        {/* Middle Headline & Feature List */}
                        <div className="relative z-20 my-auto py-2 space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
                                    Welcome to<br />
                                    <span className="text-blue-400">SwiftEntry</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-white/85 font-normal leading-relaxed">
                                    Secure, simple and efficient visitor management for your organization.
                                </p>
                            </div>

                            {/* Perfectly Aligned Feature Badges */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col justify-center space-y-0">
                                        <h5 className="text-lg font-bold text-white leading-snug">Secure Access</h5>
                                        <p className="text-xs text-white/75 leading-snug">Keep your premises safe</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col justify-center space-y-0">
                                        <h5 className="text-lg font-bold text-white leading-snug">Easy Check-ins</h5>
                                        <p className="text-xs text-white/75 leading-snug">For visitors, staff and contractors</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shrink-0 shadow-sm">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col justify-center space-y-0">
                                        <h5 className="text-lg font-bold text-white leading-snug">Real-time Insights</h5>
                                        <p className="text-xs text-white/75 leading-snug">Track and manage with ease</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Security Badge Tag */}
                        <div className="relative z-20 pt-3 border-t border-white/10 flex items-center gap-2.5 text-xs text-white/80">
                            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>Trusted by organizations across different industries.</span>
                        </div>

                    </aside>

                    {/* RIGHT SIDE: Form Section */}
                    <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative bg-[rgb(252,253,255)] h-full overflow-y-auto">

                        {/* Mobile Brand Header */}
                        <div className="flex lg:hidden items-center justify-center w-full mb-3">
                            <img
                                src={SwiftEntryLogo}
                                alt="SwiftEntry"
                                className="h-14 sm:h-16 w-auto object-contain"
                            />
                        </div>

                        {/* Form Inputs Container */}
                        <div className="max-w-md w-full mx-auto space-y-3 pt-6">

                            {/* Header Logo & Title Aligned */}
                            <div className="space-y-2 mb-4">
                                <div className="hidden lg:flex items-center justify-center mt-4">
                                    <img
                                        src={SwiftEntryLogo}
                                        alt="SwiftEntry"
                                        className="h-20 w-auto object-contain"
                                    />
                                </div>

                                <div className="space-y-0.5">
                                    <p className="text-2xl font-bold text-slate-900 tracking-tight">
                                        Create Admin Account
                                    </p>
                                    <p className="text-xs text-[#7a8aa3] font-medium">
                                        Access your SwiftEntry account to continue.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-2">

                                {/* Full Name Field */}
                                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Full Name *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your full name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Email *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="john.doe@gmail.com"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Department Field */}
                                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Department
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            name="department"
                                            placeholder="Operations, IT, HR (optional)"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Password *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••••••"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 border-0 bg-transparent p-0 cursor-pointer"
                                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                                        >
                                            {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 px-3 transition-all duration-200 focus-within:border-[#1287ef] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1287ef]/10">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Confirm Password *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            type={confirmPasswordVisible ? "text" : "password"}
                                            name="password_confirmation"
                                            placeholder="••••••••••••"
                                            required
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className="w-full bg-transparent text-slate-900 text-xs font-medium focus:outline-none placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 border-0 bg-transparent p-0 cursor-pointer"
                                            aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                                        >
                                            {confirmPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-1">
                                    <div
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 bg-gradient-to-r from-[#1798f5] to-[#0755e8] hover:opacity-95 text-white font-bold !rounded-full text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-base font-light leading-none">→</span>
                                                <span className="text-base">Create Admin Account</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Navigation Link */}
                                <p className="text-center text-xs text-slate-500 font-medium pt-1">
                                    Already have an account?{" "}
                                    <Link to="/" className="text-blue-600 hover:underline font-bold">
                                        Sign In
                                    </Link>
                                </p>

                            </form>
                        </div>

                        {/* Security Footer Line */}
                        <footer className="security-note flex items-center gap-4 w-full max-w-md mx-auto pt-2 text-[#8291aa] text-[11px]">
                            <span className="h-[1px] flex-1 bg-[#dce4ee]" />
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <ShieldCheck className="w-4 h-4 text-[#6684ab]" />
                                <p className="m-0">Your security is our priority.</p>
                            </div>
                            <span className="h-[1px] flex-1 bg-[#dce4ee]" />
                        </footer>

                    </div>

                </div>
            </div>
        </>
    );
}

export default AdminRegister;