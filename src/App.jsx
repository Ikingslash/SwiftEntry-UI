import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


import SignIn from "./pages/SignIn";
import AdminRegister from "./pages/AdminRegister";
import Loading from "./pages/Loading";
import PasswordSuccessAlert from "./pages/PasswordSuccessAlert";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyAccount from "./pages/VerifyAccount";
import SetNewPassword from "./pages/SetNewPassword";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./customRoute/PrivateRoute";

import StaffLayout from "./layout/StaffLayout";
import Dashboard from "./pages/Dashboard";
import NewGuest from "./pages/staffDashboard/NewGuest";
import Notifications from "./pages/staffDashboard/Notifications";
import Profile from "./pages/staffDashboard/Profile";
import ManageGuestsIndividual from "./pages/staffDashboard/ManageGuestsIndividual";
import StaffSettings from "./pages/staffDashboard/StaffSettings";

import FrontDeskLayout from "./layout/FrontDeskLayout";
import FrontDeskDashboard from "./pages/FrontDeskDashboard";
import RegisterGuest from "./pages/frontDeskDashboard/RegisterGuest";
import VisitHistory from "./pages/frontDeskDashboard/VisitHistory";
import FrontDeskNotifications from "./pages/frontDeskDashboard/FrontDeskNotifications";
import FrontDeskProfile from "./pages/frontDeskDashboard/FrontDeskProfile";
import FrontDeskSettings from "./pages/frontDeskDashboard/FrontDeskSettings";
import ManageFrontdeskGuestsIndividual from "./pages/frontDeskDashboard/ManageFrontdeskGuestsIndividual";
import ConfirmVisitor from "./pages/frontDeskDashboard/ConfirmVisitor";


import SecurityLayout from "./layout/SecurityLayout";
import SecurityDashboard from "./pages/SecurityDashboard";
import GenerateQRCode from "./pages/securityDashboard/GenerateQRCode";
import GenerateByUniqueCode from "./pages/securityDashboard/GenerateByUniqueCode";
import RegisterNewGuest from "./pages/securityDashboard/RegisterNewGuest";
import VisitSecurityHistory from "./pages/securityDashboard/VisitSecurityHistory";
import SecurityNotifications from "./pages/securityDashboard/SecurityNotifications";
import SecurityProfile from "./pages/securityDashboard/SecurityProfile";
import SecuritySettings from "./pages/securityDashboard/SecuritySettings";
import ManageSecurityGuestsIndividual from "./pages/securityDashboard/ManageSecurityGuestsIndividual";

import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVisitors from "./pages/admin/visitorsManagment/AdminVisitors";
import AdminStaff from "./pages/admin/staffManagment/AdminStaff";
import AdminManagement from "./pages/admin/adminManagement/AdminManagement";
import AdminFrontdesk from "./pages/admin/staffManagment/AdminFrontdesk";
import AdminSecurity from "./pages/admin/staffManagment/AdminSecurity";
import AdminSelfService from "./pages/admin/staffManagment/AdminSelfService";
import AnalyticalAndReport from "./pages/admin/analytical_report/AnalyticalAndReport";
import AdminSettings from "./pages/admin/settings/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPriorityAlerts from "./pages/admin/AdminPriorityAlerts";
import AdminLatestUpdates from "./pages/admin/AdminLatestUpdates";
import AdminNewGuest from "./pages/admin/registerVisit/NewGuest";
import SetupPassword from "./pages/SetupPassword";
import FrontdeskSetupPassword from "./pages/FrontdeskSetupPassword";
import SecuritySetupPassword from "./pages/SecuritySetupPassword";
import VisitorSelfServiceDashboard from "./pages/VisitorSelfServiceDashboard";
import VisitorWalkInRegistration from "./pages/VisitorWalkInRegistration";
import VisitorProfile from "./pages/VisitorProfile";


<Route path="/admin/new-guest" element={<AdminNewGuest />} />


function App() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LfIP1AsAAAAAL06_8oGFfAquyg879TXvZ7fYhb7"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <div className="App">
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SignIn />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/password-success" element={<PasswordSuccessAlert />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />
              <Route path="/setup-password" element={<SetupPassword />} />
              <Route path="/frontdesk-setup-password" element={<FrontdeskSetupPassword />} />
              <Route path="/security-setup-password" element={<SecuritySetupPassword />} />

              {/* Protected Routes */}
              <Route
                path="/staff-dashboard/*"
                element={
                  <PrivateRoute requiredRole="staff">
                    <StaffLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="new-guest" element={<NewGuest />} />
                <Route path="manage-guest" element={<ManageGuestsIndividual />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="staff-settings" element={<StaffSettings />} />
              </Route>

              <Route
                path="/front-desk-dashboard/*"
                element={
                  <PrivateRoute requiredRole="front_desk">
                    <FrontDeskLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<FrontDeskDashboard />} />
                <Route path="register-guest" element={<RegisterGuest />} />
                <Route path="history" element={<VisitHistory />} />
                <Route path="notifications" element={<FrontDeskNotifications />} />
                <Route
                  path="manage-frontdesk-guests"
                  element={<ManageFrontdeskGuestsIndividual />}
                />
                <Route path="profile" element={<FrontDeskProfile />} />
                <Route
                  path="front-desk-settings"
                  element={<FrontDeskSettings />}
                />
                <Route path="confirm-visitor" element={<ConfirmVisitor />} />
              </Route>

              <Route
                path="/admin-dashboard/*"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="visitors" element={<AdminVisitors />} />
                <Route path="staffs" element={<AdminStaff />} />
                <Route path="admins" element={<AdminManagement />} />
                <Route path="frontdesk" element={<AdminFrontdesk />} />
                <Route path="security" element={<AdminSecurity />} />
                <Route path="self-service" element={<AdminSelfService />} />
                <Route
                  path="analytical-report"
                  element={<AnalyticalAndReport />}
                />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="new-guest" element={<AdminNewGuest />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="alerts" element={<AdminPriorityAlerts />} />
                <Route path="updates" element={<AdminLatestUpdates />} />
              </Route>

              <Route
                path="/security-dashboard/*"
                element={
                  <PrivateRoute requiredRole="security">
                    <SecurityLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<SecurityDashboard />} />
                <Route path="generate-qr-code" element={<GenerateQRCode />} />
                <Route
                  path="generate-by-unique-code"
                  element={<GenerateByUniqueCode />}
                />
                <Route path="register-new-guest" element={<RegisterNewGuest />} />
                <Route path="history" element={<VisitSecurityHistory />} />
                <Route path="notifications" element={<SecurityNotifications />} />
                <Route
                  path="manage-security-guests"
                  element={<ManageSecurityGuestsIndividual />}
                />
                <Route path="profile" element={<SecurityProfile />} />
                <Route path="security-settings" element={<SecuritySettings />} />
              </Route>

              {/* Visitor Self-Service Routes */}
              <Route
                path="/visitor-dashboard/*"
                element={
                  <PrivateRoute requiredRole="self_service">
                    <VisitorSelfServiceDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/visitor-dashboard/register-visit"
                element={
                  <PrivateRoute requiredRole="self_service">
                    <VisitorWalkInRegistration />
                  </PrivateRoute>
                }
              />
              <Route
                path="/visitor-dashboard/profile"
                element={
                  <PrivateRoute requiredRole="self_service">
                    <VisitorProfile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </GoogleReCaptchaProvider>
  );
}

export default App;
