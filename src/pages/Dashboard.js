import React from 'react';
import { Home, Key, Users, LogOut, Menu, X } from 'lucide-react';

const Dashboard = () => {
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
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">CV</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Cloud Verification</h2>
              <p className="text-xs text-gray-500">System</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-600">
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Key size={20} />
            <span>Device License Key</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Users size={20} />
            <span>User Account</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to Cloud Verification System</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm mb-2">Total Device License Keys</h3>
            <p className="text-4xl font-bold text-gray-800">{appStats.all}</p>
            <p className="text-sm text-teal-600 mt-2">All Applications</p>
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
              <h3 className="font-semibold text-gray-700 mb-3">Device License Key Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-teal-600">{licenseKeyStats.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full" 
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
                  <span className="font-semibold text-teal-600">
                    {userStats.activeUsers}/{userStats.totalUsers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full" 
                    style={{ width: `${userStats.activityRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600">Activity Rate</span>
                  <span className="font-semibold text-teal-600">{userStats.activityRate}%</span>
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
  );
};

export default Dashboard;