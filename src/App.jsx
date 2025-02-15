import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Loading from "./pages/Loading";
import PasswordSuccessAlert from "./pages/PasswordSuccessAlert";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyAccount from "./pages/VerifyAccount";
import SetNewPassword from "./pages/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import SchoolLandingPage from './pages/SchoolLandingPage';

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
        <Route path="/school-landing-page" element={<SchoolLandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;