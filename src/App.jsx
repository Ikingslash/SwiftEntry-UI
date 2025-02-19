import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Loading from "./pages/Loading";
import PasswordSuccessAlert from "./pages/PasswordSuccessAlert";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyAccount from "./pages/VerifyAccount";
import SetNewPassword from "./pages/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import NewGuest from "./pages/dashboard/NewGuest";
import Notifications from "./pages/dashboard/Notifications";
import ManageGuestsIndividual from "./pages/dashboard/ManageGuestsIndividual";
import SchoolLandingPage from "./pages/SchoolLandingPage";

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-guest" element={<NewGuest />} />
        <Route path="/manage-guest" element={<ManageGuestsIndividual />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/school-landing-page" element={<SchoolLandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
