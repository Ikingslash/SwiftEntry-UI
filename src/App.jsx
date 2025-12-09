import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import SignIn from "./pages/SignIn";
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
import AdminFrontdesk from "./pages/admin/staffManagment/AdminFrontdesk";
import AdminSecurity from "./pages/admin/staffManagment/AdminSecurity";
import AnalyticalAndReport from "./pages/admin/analytical_report/AnalyticalAndReport";
import AdminSettings from "./pages/admin/settings/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPriorityAlerts from "./pages/admin/AdminPriorityAlerts";
import AdminLatestUpdates from "./pages/admin/AdminLatestUpdates";
import AdminNewGuest from "./pages/admin/registerVisit/NewGuest";
import SetupPassword from "./pages/admin/SetupPassword";

<Route path="/admin/new-guest" element={<AdminNewGuest />} />


function App() {
 return (
   <div className="App">
     <AuthProvider>
       <NotificationProvider>
         <Routes>
           {/* Public Routes */}
           <Route path="/" element={<SignIn />} />
           <Route path="/loading" element={<Loading />} />
           <Route path="/password-success" element={<PasswordSuccessAlert />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/verify-account" element={<VerifyAccount />} />
           <Route path="/set-new-password" element={<SetNewPassword />} />
           <Route path="/setup-password" element={<SetupPassword />} />

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
             <Route path="frontdesk" element={<AdminFrontdesk />} />
             <Route path="security" element={<AdminSecurity />} />
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
         </Routes>
       </NotificationProvider>
     </AuthProvider>
     <ToastContainer position="top-right" autoClose={5000} />
   </div>
 );
}

export default App;
