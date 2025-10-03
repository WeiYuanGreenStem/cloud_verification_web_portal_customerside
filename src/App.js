import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import DeviceLicenseKeyManagement from './pages/DeviceLicenseKeyManagement';
import UserAccountManagement from './pages/UserAccountManagement';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/devices" element={<DeviceLicenseKeyManagement />} />
        <Route path="/users" element={<UserAccountManagement />} />
      </Routes>
    </Router>
  );
};

export default App;

//fafdsa