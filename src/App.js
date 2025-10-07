import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import DeviceLicenseKeyManagement from './pages/DeviceLicenseKeyManagement';
import UserAccountManagement from './pages/UserAccountManagement';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/devices" element={<DeviceLicenseKeyManagement />} />
        <Route path="/users" element={<UserAccountManagement />} />
      </Routes>
    </Router>
  );
};

export default App;

