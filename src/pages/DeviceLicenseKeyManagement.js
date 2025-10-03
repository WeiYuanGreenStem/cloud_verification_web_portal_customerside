import React, { useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DeviceLicenseKeyManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const appStats = {
    all: 26,
    warehouse: 13,
    salesman: 10,
    management: 3
  };

  const licenseKeys = [
    { 
      id: 'x7QpPmA2fZL8', 
      app: 'WHA', 
      status: 'Active', 
      created: '26-06-2024', 
      lastUsed: '2025-08-19 11:32:15', 
      lastUpdate: '2025-08-19 11:54:26', 
      device: 'iPhone 15 Pro (John Smith)' 
    },
    { 
      id: 'T1hKcvRSsPOw', 
      app: 'SMA', 
      status: 'Inactive', 
      created: '15-11-2024', 
      lastUsed: '2025-08-19 14:18:56', 
      lastUpdate: '2025-08-27 13:20:53', 
      device: 'Oppo Find X7 (Olivia Bennett)' 
    },
    { 
      id: 'b4Yi8Ncg2ES5', 
      app: 'WHA', 
      status: 'Inactive', 
      created: '08-07-2024', 
      lastUsed: '2025-03-15 22:15:06', 
      lastUpdate: '2025-09-05 12:43:09', 
      device: 'Samsung Galaxy S23 (Daniel Warren)' 
    },
    { 
      id: 'L9eXZM7aV6d', 
      app: 'MNGA', 
      status: 'Active', 
      created: '11-09-2024', 
      lastUsed: '2025-09-11 19:06:22', 
      lastUpdate: '2025-09-08 09:18:48', 
      device: 'Honor Magic6 (Chloe Hayes)' 
    },
    { 
      id: 'pD6k5Hn8yJ2u', 
      app: 'SMA', 
      status: 'Inactive', 
      created: '29-10-2024', 
      lastUsed: '2024-12-25 10:54:11', 
      lastUpdate: '2025-09-10 17:25:38', 
      device: 'iPhone SE 2025 (Marcus Reed)' 
    },
    { 
      id: 'R3vW7zQTcF9x', 
      app: 'WHA', 
      status: 'Active', 
      created: '27-08-2024', 
      lastUsed: '2025-09-10 08:54:16', 
      lastUpdate: '2025-09-23 11:44:11', 
      device: 'Samsung Z Fold6 (Isabelle Clark)' 
    },
    { 
      id: 'M6tD2yB8sK4g', 
      app: 'MNGA', 
      status: 'Active', 
      created: '14-03-2024', 
      lastUsed: '2025-09-24 07:40:11', 
      lastUpdate: '2025-08-04 15:21:09', 
      device: 'Google Pixel 9 Pro (Lucas Mitchell)' 
    },
  ];

  const handleEdit = (id) => {
    console.log('Edit license key:', id);
    // Add your edit logic here
  };

  const handleDelete = (id) => {
    console.log('Delete license key:', id);
    // Add your delete logic here
  };

  const filteredKeys = licenseKeys.filter(key => {
    if (activeTab === 'all') return true;
    if (activeTab === 'warehouse') return key.app === 'WHA';
    if (activeTab === 'management') return key.app === 'MNGA';
    if (activeTab === 'salesman') return key.app === 'SMA';
    return true;
  }).filter(key => 
    key.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.device.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredKeys.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentKeys = filteredKeys.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="Device License Key Management"
          subtitle="Manage all license keys in one place"
        />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Device License Key Management
            </h1>
            <p className="text-gray-600">
              Manage all license keys in one place. Control access, assign roles, and monitor activity across your platform.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">All Application</h3>
              <p className="text-5xl font-bold text-gray-800">{appStats.all}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Warehouse Application</h3>
              <p className="text-5xl font-bold text-gray-800">{appStats.warehouse}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Salesman Application</h3>
              <p className="text-5xl font-bold text-gray-800">{appStats.salesman}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <h3 className="text-gray-600 text-sm mb-2">Management Application</h3>
              <p className="text-5xl font-bold text-gray-800">{appStats.management}</p>
            </div>
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
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">License Key</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Application</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Create Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Last Used</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Last Update</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Device Information</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentKeys.map((key, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800 font-mono">{key.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{key.app}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          key.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{key.created}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{key.lastUsed}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{key.lastUpdate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{key.device}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(key.id)}
                            className="text-teal-600 hover:text-teal-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(key.id)}
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

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-4">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredKeys.length)} of {filteredKeys.length} rows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                
                {/* Page Numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gray-800 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-800 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceLicenseKeyManagement;