import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApiService from '../services/api';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    // Handle browser back/forward navigation
    const handlePopState = () => {
      if (!ApiService.isAuthenticated()) {
        navigate('/login', { replace: true });
      }
    };

    // Add event listener for browser navigation
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const appStats = {
    all: 26,
    warehouse: 13,
    salesman: 10,
    management: 3
  };

  const licenseKeyStats = {
    active: 15,
    inactive: 11
  };

  const userStats = {
    activeUsers: 19,
    totalUsers: 20,
    activityRate: 95
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="Dashboard"
          subtitle="Welcome to Cloud Verification System"
        />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to Cloud Verification System</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Total License Keys</h3>
              <p className="text-4xl font-bold text-gray-800">{appStats.all}</p>
              <p className="text-sm text-green-600 mt-2">All Applications</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Warehouse App</h3>
              <p className="text-4xl font-bold text-gray-800">{appStats.warehouse}</p>
              <p className="text-sm text-blue-600 mt-2">Active licenses</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Salesman App</h3>
              <p className="text-4xl font-bold text-gray-800">{appStats.salesman}</p>
              <p className="text-sm text-purple-600 mt-2">Active licenses</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Management App</h3>
              <p className="text-4xl font-bold text-gray-800">{appStats.management}</p>
              <p className="text-sm text-amber-600 mt-2">Active licenses</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">License Key Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active</span>
                    <span className="font-semibold text-green-600">{licenseKeyStats.active}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(licenseKeyStats.active / (licenseKeyStats.active + licenseKeyStats.inactive)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">Inactive</span>
                    <span className="font-semibold text-red-600">{licenseKeyStats.inactive}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(licenseKeyStats.inactive / (licenseKeyStats.active + licenseKeyStats.inactive)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">User Activity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold text-green-600">
                      {userStats.activeUsers}/{userStats.totalUsers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${userStats.activityRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">Activity Rate</span>
                    <span className="font-semibold text-green-600">{userStats.activityRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">New license key created</p>
                    <p className="text-xs text-gray-500">WHA - x7QpPmA2fZL8</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">User account updated</p>
                    <p className="text-xs text-gray-500">John Smith - Status changed</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">License key expired</p>
                    <p className="text-xs text-gray-500">SMA - T1hKcvRSsPOw</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;