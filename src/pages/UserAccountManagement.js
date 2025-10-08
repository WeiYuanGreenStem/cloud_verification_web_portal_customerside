import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApiService from '../services/api';

const UserAccountManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication protection
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

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const userStats = {
    all: { active: 19, total: 20, percentage: 95 },
    warehouse: { active: 6, total: 6, percentage: 100 },
    salesman: { active: 6, total: 7, percentage: 86 },
    management: { active: 7, total: 7, percentage: 100 }
  };

  const users = [
    { 
      username: 'John Smith', 
      email: 'john.smith@gmail.com', 
      app: 'WHA', 
      status: 'Active', 
      position: 'StoreKeeper', 
      area: 'IPOH', 
      created: '26-06-2024', 
      lastActive: '2025-08-19 11:32:15', 
      lastUpdate: '2025-08-19 11:54:26', 
      device: 'iPhone 15 Pro (John Smith)' 
    },
    { 
      username: 'Olivia Bennett', 
      email: 'olivyben@gmail.com', 
      app: 'SMA', 
      status: 'Inactive', 
      position: 'Accountant', 
      area: 'KL', 
      created: '15-11-2024', 
      lastActive: '2025-06-19 14:18:56', 
      lastUpdate: '2025-08-27 13:20:53', 
      device: 'Oppo Find X7 (Olivia Bennett)' 
    },
    { 
      username: 'Daniel Warren', 
      email: 'dwarren3@gmail.com', 
      app: 'WHA', 
      status: 'Inactive', 
      position: 'Salesman', 
      area: 'Klang', 
      created: '08-07-2024', 
      lastActive: '2025-03-15 22:15:06', 
      lastUpdate: '2025-09-05 12:43:09', 
      device: 'Samsung Galaxy S23 (Daniel Warren)' 
    },
    { 
      username: 'Chloe Hayes', 
      email: 'chloehiyes@gmail.com', 
      app: 'MNGA', 
      status: 'Active', 
      position: 'Manager', 
      area: 'KL', 
      created: '11-09-2024', 
      lastActive: '2025-09-11 19:06:22', 
      lastUpdate: '2025-09-08 09:18:48', 
      device: 'Honor Magic6 (Chloe Hayes)' 
    },
    { 
      username: 'Marcus Reed', 
      email: 'reeds777@gmail.com', 
      app: 'SMA', 
      status: 'Inactive', 
      position: 'StoreKeeper', 
      area: 'IPOH', 
      created: '29-10-2024', 
      lastActive: '2024-12-25 10:54:11', 
      lastUpdate: '2025-09-10 17:25:38', 
      device: 'iPhone SE 2025 (Marcus Reed)' 
    },
    { 
      username: 'Isabelle Clark', 
      email: 'belleclark@gmail.com', 
      app: 'WHA', 
      status: 'Active', 
      position: 'Director', 
      area: 'KL', 
      created: '27-08-2024', 
      lastActive: '2025-01-10 08:54:16', 
      lastUpdate: '2025-09-23 11:44:11', 
      device: 'Samsung Z Fold6 (Isabelle Clark)' 
    },
    { 
      username: 'Lucas Mitchell', 
      email: 'lucasmitch@gmail.com', 
      app: 'MNGA', 
      status: 'Active', 
      position: 'CEO', 
      area: 'KL', 
      created: '14-03-2024', 
      lastActive: '2025-09-24 07:40:11', 
      lastUpdate: '2025-08-04 15:21:09', 
      device: 'Google Pixel 9 Pro (Lucas Mitchell)' 
    },
  ];

  const handleEdit = (username) => {
    // Check authentication before allowing edit
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    console.log('Edit user:', username);
  };

  const handleDelete = (username) => {
    // Check authentication before allowing delete
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    console.log('Delete user:', username);
  };

  const handleCreateUser = () => {
    // Check authentication before allowing create
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    setShowCreateModal(true);
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'warehouse') return user.app === 'WHA';
    if (activeTab === 'management') return user.app === 'MNGA';
    if (activeTab === 'salesman') return user.app === 'SMA';
    return true;
  }).filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Don't render content if not authenticated
  if (!ApiService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="User Account Management"
          subtitle="Manage all users in one place"
        />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              User Account Management
            </h1>
            <p className="text-gray-600">
              Manage all users in one place. Control access, assign roles, and monitor activity across your platform.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {Object.entries(userStats).map(([key, value]) => {
              const colors = {
                all: { chart: 'text-red-500', bg: 'bg-red-50', border: 'border-red-500' },
                warehouse: { chart: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500' },
                salesman: { chart: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' },
                management: { chart: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-500' }
              };
              
              return (
                <div key={key} className={`${colors[key].bg} rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100`}>
                  <h3 className="text-gray-600 text-sm mb-4 capitalize">
                    {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)} Application
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 lg:w-20 h-16 lg:h-20 rounded-full border-4 ${colors[key].border} flex items-center justify-center ${colors[key].chart}`}>
                      <span className="text-sm font-bold">{value.percentage}%</span>
                    </div>
                    <div>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                        {value.active} / {value.total}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>📱</span> All Application
                </button>
                <button 
                  onClick={() => setActiveTab('warehouse')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'warehouse' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>🏠</span> Warehouse App
                </button>
                <button 
                  onClick={() => setActiveTab('management')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'management' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>💼</span> Management App
                </button>
                <button 
                  onClick={() => setActiveTab('salesman')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'salesman' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>👤</span> Salesman App
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button 
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Create New User</span>
                </button>
              </div>
            </div>

            {/* Table - keeping your existing table structure */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Application</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Area</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Create Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Last Active</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Last Update</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Last Device Used</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.slice(0, rowsPerPage).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.app}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.created}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.lastUpdate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.device}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(user.username)}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.username)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - keeping your existing pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-4">of {filteredUsers.length} rows</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">«</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">‹</button>
                <button className="px-3 py-1 bg-gray-800 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">3</button>
                <span className="px-2">...</span>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">10</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">›</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New User</h2>
            <p className="text-gray-600 mb-4">Modal content coming soon...</p>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountManagement;