import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Loading from "./pages/Loading";
import PasswordSuccessAlert from "./pages/PasswordSuccessAlert";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyAccount from "./pages/VerifyAccount";
import SetNewPassword from "./pages/SetNewPassword";

import StaffLayout from "./layout/StaffLayout";
import Dashboard from "./pages/Dashboard";
import NewGuest from "./pages/staffDashboard/NewGuest";
import Notifications from "./pages/staffDashboard/Notifications";
import Profile from "./pages/staffDashboard/Profile";
import ManageGuestsIndividual from "./pages/staffDashboard/ManageGuestsIndividual";

import FrontDeskLayout from "./layout/FrontDeskLayout";
import FrontDeskDashboard from "./pages/FrontDeskDashboard";
import RegisterGuest from "./pages/frontDeskDashboard/RegisterGuest";

import SecurityLayout from "./layout/SecurityLayout";
import SecurityDashboard from "./pages/SecurityDashboard";

import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/password-success" element={<PasswordSuccessAlert />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />

        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-guest" element={<NewGuest />} />
        <Route path="/manage-guest" element={<ManageGuestsIndividual />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} /> */}
        <Route path="/dashboard" element={<StaffLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-guest" element={<NewGuest />} />
          <Route path="manage-guest" element={<ManageGuestsIndividual />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/front-desk-dashboard" element={<FrontDeskLayout />}>
          <Route index element={<FrontDeskDashboard />} />
          <Route path="register-guest" element={<RegisterGuest />} />
  {/* <Route path="manage-guest" element={<ManageGuestsIndividual />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="profile" element={<Profile />} /> */}
        </Route>

        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* <Route path="new-guest" element={<NewGuest />} />
  <Route path="manage-guest" element={<ManageGuestsIndividual />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="profile" element={<Profile />} /> */}
        </Route>

        <Route path="/security-dashboard" element={<SecurityLayout />}>
          <Route index element={<SecurityDashboard />} />
          {/* <Route path="new-guest" element={<NewGuest />} />
  <Route path="manage-guest" element={<ManageGuestsIndividual />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="profile" element={<Profile />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
