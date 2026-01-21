import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from "../context/api";

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
            <div
                className="container-fluid d-flex align-items-center justify-content-center vh-100 p-0"
                style={{ backgroundColor: "#F5FAFE", overflow: "hidden" }}
            >
                <div className="row w-100 h-100 d-flex align-items-center justify-content-center g-0">
                    {/* Left Section (Video Background) */}
                    <div
                        className="col-lg-5 offset-md-1 d-none d-lg-block position-relative p-0"
                        style={{
                            height: "100vh",
                            overflow: "hidden",
                        }}
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-100 h-100 object-fit-cover p-4 rounded-5"
                            style={{ objectFit: "cover" }}
                        >
                            <source src="./video3.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <div
                            className="position-absolute bottom-0 start-50 translate-middle-x text-white ms-4 p-4 w-100"
                            style={{
                                fontSize: "22px",
                                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <div className="d-flex">
                                <img src="./image2.png" width={70} alt="" />
                            </div>
                            <p className="fw-bold fs-5 text-shadow">
                                Ready to Manage Guests with Ease? <br /> Let's Get You Started
                            </p>
                        </div>
                    </div>

                    {/* Right Section (Registration Form) */}
                    <div
                        className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3"
                        style={{
                            height: "100vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="w-100 p-4" style={{ maxWidth: "576px" }}>
                            <div className="d-flex p-2 justify-content-center">
                                <img src="./image.png" width={150} className="py-2" alt="" />
                            </div>

                            <h2 className="text-center mb-3 fw-bold">Admin Registration</h2>
                            <p className="text-center text-muted mb-4">
                                Create your administrator account
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        placeholder="Enter your full name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        placeholder="Enter your email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="department"
                                        placeholder="Enter your department (optional)"
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3 position-relative">
                                    <label className="form-label fw-semibold">Password *</label>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        className="form-control"
                                        name="password"
                                        placeholder="Enter password (min 8 characters)"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <span
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="position-absolute top-50 end-0 translate-middle-y m-3"
                                        style={{ cursor: "pointer", color: "#007bff", marginTop: "15px" }}
                                    >
                                        {passwordVisible ? "👁️" : "👁️‍🗨️"}
                                    </span>
                                </div>

                                <div className="mb-3 position-relative">
                                    <label className="form-label fw-semibold">Confirm Password *</label>
                                    <input
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        className="form-control"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        required
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                    />
                                    <span
                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        className="position-absolute top-50 end-0 translate-middle-y m-3"
                                        style={{ cursor: "pointer", color: "#007bff", marginTop: "15px" }}
                                    >
                                        {confirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
                                    </span>
                                </div>

                                <div className="text-center mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Creating Account..." : "Create Admin Account"}
                                    </button>
                                </div>

                                <div className="text-center mt-3">
                                    <span className="text-muted">Already have an account? </span>
                                    <Link to="/" className="text-primary text-decoration-none fw-semibold">
                                        Sign In
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminRegister;
