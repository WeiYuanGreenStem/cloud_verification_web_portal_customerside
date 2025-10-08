import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApiService from '../services/api';

const DeviceLicenseKeyManagement = () => {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // API Data States
  const [licenseKeys, setLicenseKeys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const getCustomerCode = () => {
    const customerCode = ApiService.getCurrentCustomerCode();
    if (customerCode) {
      return customerCode;
    }
    
    const customerData = ApiService.getCurrentUser();
    if (customerData) {
      if (customerData.customers && customerData.customers.length > 0) {
        return customerData.customers[0].customerCode;
      }
      if (customerData.customerCode) {
        return customerData.customerCode;
      }
      if (customerData.CustomerCode) {
        return customerData.CustomerCode;
      }
      if (customerData.customer_code) {
        return customerData.customer_code;
      }
    }
    
    console.error('No customer code found in stored data');
    return null;
  };

  // Fetch device license keys data
  const fetchDeviceLicenseKeys = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Double-check authentication before making API calls
      if (!ApiService.isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }
      
      const customerCode = getCustomerCode();
      if (!customerCode) {
        setError('Customer authentication required. Please log in again.');
        return;
      }
      
      // Fetch device license keys
      const result = await ApiService.getDeviceLicenseKeysForCustomerPortal(customerCode);
      
      if (result.success) {
        if (result.data?.success === true || result.data?.Success === true) {
          setLicenseKeys(result.data.data || result.data.Data || []);
        } else {
          const errorMessage = result.data?.message || result.data?.Message || 'Failed to fetch device license keys';
          setError(errorMessage);
          return;
        }
      } else if (result.status === 401 || result.isAuthError) {
        setError('Your session has expired. Please log in again.');
        // Redirect to login on authentication error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        return;
      } else {
        const errorMessage = result.error || 'Failed to fetch device license keys';
        setError(errorMessage);
        return;
      }
      
      // Fetch statistics
      const statsResult = await ApiService.getDeviceLicenseKeyStatistics(customerCode);
      
      if (statsResult.success && (statsResult.data?.success === true || statsResult.data?.Success === true)) {
        setStatistics(statsResult.data.data || statsResult.data.Data);
      }
      
    } catch (error) {
      console.error('Error fetching device license keys:', error);
      setError(error.message || 'An unexpected error occurred while fetching device license keys');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    // Check authentication before refreshing
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    
    setIsRefreshing(true);
    await fetchDeviceLicenseKeys();
    setIsRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    if (!hasFetchedRef.current && ApiService.isAuthenticated()) {
      hasFetchedRef.current = true;
      fetchDeviceLicenseKeys();
    }
  }, [navigate]);

  const handleEdit = (deviceLicenseKeyCode) => {
    console.log('Edit license key:', deviceLicenseKeyCode);
    // Add your edit logic here
  };

  const handleDelete = (deviceLicenseKeyCode) => {
    console.log('Delete license key:', deviceLicenseKeyCode);
    // Add your delete logic here
  };

  const filteredKeys = licenseKeys.filter(key => {
    // Filter by application type
    let appFilter = true;
    if (activeTab === 'warehouse') {
      appFilter = key.applicationName?.toLowerCase().includes('warehouse') || 
                  key.applicationName?.toLowerCase().includes('wha');
    } else if (activeTab === 'management') {
      appFilter = key.applicationName?.toLowerCase().includes('management') ||
                  key.applicationName?.toLowerCase().includes('mnga');
    } else if (activeTab === 'salesman') {
      appFilter = key.applicationName?.toLowerCase().includes('salesman') ||
                  key.applicationName?.toLowerCase().includes('sma');
    }
    
    // Filter by search term
    const searchFilter = !searchTerm || 
      key.deviceLicenseKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.deviceInformation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.applicationName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return appFilter && searchFilter;
  });

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

  const appStats = statistics ? {
    all: statistics.totalDeviceKeys || statistics.TotalDeviceKeys || 0,
    warehouse: statistics.applications?.find(app => 
      app.applicationName?.toLowerCase().includes('warehouse') || 
      app.ApplicationName?.toLowerCase().includes('warehouse')
    )?.count || statistics.Applications?.find(app => 
      app.ApplicationName?.toLowerCase().includes('warehouse')
    )?.Count || 0,
    salesman: statistics.applications?.find(app => 
      app.applicationName?.toLowerCase().includes('salesman') || 
      app.ApplicationName?.toLowerCase().includes('salesman')
    )?.count || statistics.Applications?.find(app => 
      app.ApplicationName?.toLowerCase().includes('salesman')
    )?.Count || 0,
    management: statistics.applications?.find(app => 
      app.applicationName?.toLowerCase().includes('management') || 
      app.ApplicationName?.toLowerCase().includes('management')
    )?.count || statistics.Applications?.find(app => 
      app.ApplicationName?.toLowerCase().includes('management')
    )?.Count || 0
  } : {
    all: licenseKeys.length,
    warehouse: licenseKeys.filter(k => 
      k.applicationName?.toLowerCase().includes('warehouse')
    ).length,
    salesman: licenseKeys.filter(k => 
      k.applicationName?.toLowerCase().includes('salesman')
    ).length,
    management: licenseKeys.filter(k => 
      k.applicationName?.toLowerCase().includes('management')
    ).length
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format datetime helper
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return dateString;
    }
  };

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
          title="Device License Key Management"
          subtitle="Manage all license keys in one place"
        />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Device License Key Management
                </h1>
                <p className="text-gray-600">
                  Manage all license keys in one place. Control access, assign roles, and monitor activity across your platform.
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button
                onClick={handleRefresh}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading device license keys...</span>
            </div>
          ) : (
            <>
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
                      <span>📱</span> All Application ({appStats.all})
                    </button>
                    <button 
                      onClick={() => setActiveTab('warehouse')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        activeTab === 'warehouse' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>🏠</span> Warehouse App ({appStats.warehouse})
                    </button>
                    <button 
                      onClick={() => setActiveTab('management')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        activeTab === 'management' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>💼</span> Management App ({appStats.management})
                    </button>
                    <button 
                      onClick={() => setActiveTab('salesman')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        activeTab === 'salesman' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>👤</span> Salesman App ({appStats.salesman})
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text"
                      placeholder="Search license keys or devices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
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
                      {currentKeys.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                            {filteredKeys.length === 0 && !isLoading ? 
                              'No device license keys found' : 
                              'No results match your search criteria'
                            }
                          </td>
                        </tr>
                      ) : (
                        currentKeys.map((key, index) => (
                          <tr key={key.deviceLicenseKeyCode || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-800 font-mono">
                              {key.deviceLicenseKey || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {key.applicationName || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                key.statusName?.toLowerCase() === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : key.statusName?.toLowerCase() === 'pending'
                                  ? 'bg-orange-100 text-orange-700'
                                  : key.statusName?.toLowerCase() === 'inactive'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {key.statusName || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(key.createDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDateTime(key.lastUsed)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDateTime(key.lastUpdate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {key.deviceInformation || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEdit(key.deviceLicenseKeyCode)}
                                  className="text-teal-600 hover:text-teal-700 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(key.deviceLicenseKeyCode)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLicenseKeyManagement;