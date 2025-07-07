import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Loading from "./pages/Loading";
import PasswordSuccessAlert from "./pages/PasswordSuccessAlert";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyAccount from "./pages/VerifyAccount";
import SetNewPassword from "./pages/SetNewPassword";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./customRoute/PrivateRoute";

import StaffLayout from "./layout/StaffLayout";
import Dashboard from "./pages/Dashboard";
import NewGuest from "./pages/staffDashboard/NewGuest";
import Notifications from "./pages/staffDashboard/Notifications";
import Profile from "./pages/staffDashboard/Profile";
import ManageGuestsIndividual from "./pages/staffDashboard/ManageGuestsIndividual";

import FrontDeskLayout from "./layout/FrontDeskLayout";
import FrontDeskDashboard from "./pages/FrontDeskDashboard";
import RegisterGuest from "./pages/frontDeskDashboard/RegisterGuest";
import VisitHistory from "./pages/frontDeskDashboard/VisitHistory";
import FrontDeskNotifications from "./pages/frontDeskDashboard/FrontDeskNotifications";

import SecurityLayout from "./layout/SecurityLayout";
import SecurityDashboard from "./pages/SecurityDashboard";
import GenerateQRCode from "./pages/securityDashboard/GenerateQRCode";
import GenerateByUniqueCode from "./pages/securityDashboard/GenerateByUniqueCode";
import RegisterNewGuest from "./pages/securityDashboard/RegisterNewGuest";
import VisitSecurityHistory from "./pages/securityDashboard/VisitSecurityHistory";
import SecurityNotifications from "./pages/securityDashboard/SecurityNotifications";

import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVisitors from "./pages/admin/visitorsManagment/AdminVisitors";
import AdminStaff from "./pages/admin/staffManagment/AdminStaff";
import AnalyticalAndReport from "./pages/admin/analytical_report/AnalyticalAndReport";
import AdminSettings from "./pages/admin/settings/AdminSettings";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/password-success" element={<PasswordSuccessAlert />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />

        {/* Protected Routes - Wrapped with PrivateRoute */}
        <Route
          path="/staff-dashboard"
          element={
           
              <StaffLayout />
            
          }
        >
        {/* <Route
          path="/staff-dashboard"
          element={
            <PrivateRoute>
              <StaffLayout />
            </PrivateRoute>
          }
        > */}
          <Route index element={<Dashboard />} />
          <Route path="new-guest" element={<NewGuest />} />
          <Route path="manage-guest" element={<ManageGuestsIndividual />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/front-desk-dashboard"
          element={
            <PrivateRoute>
              <FrontDeskLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<FrontDeskDashboard />} />
          <Route path="register-guest" element={<RegisterGuest />} />
          <Route path="history" element={<VisitHistory />} />
          <Route path="notifications" element={<FrontDeskNotifications />} />
        </Route>

        <Route
          path="/admin-dashboard"
          element={
           
              <AdminLayout />
           
          }
        >
        {/* <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        > */}
          <Route index element={<AdminDashboard />} />
          <Route path="visitors" element={<AdminVisitors />} />
          <Route path="staffs" element={<AdminStaff />} />
          <Route path="analytical-report" element={<AnalyticalAndReport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/security-dashboard"
          element={
            <PrivateRoute>
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
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* john.smith@sydani.com */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
