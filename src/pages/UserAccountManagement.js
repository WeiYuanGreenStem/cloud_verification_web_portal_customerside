import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApiService from '../services/api';

const UserAccountManagement = () => {
  //Tab variables
  const [activeTab, setActiveTab] = useState('all');
  const [fetchedApps, setFetchedApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  //User table variables
  const [allUsers, setAllUsers] = useState([]); // Flattened list of users
  const [loadingUsers, setLoadingUsers] = useState(true);

  //Paging variables
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // same as pageSize
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  //Number User Widget variables
  const [appList, setAppList] = useState([]);
  const [usageStats, setUsageStats] = useState({});


  //
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const filteredUsers = allUsers
  .filter(user => {
    if (activeTab === 'all') return true;
    return user.app === activeTab;
  })
  .filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.userEmail.toLowerCase().includes(search) ||
      user.jobPosition.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    const fetchStatsAndApps = async () => {
      try {
        const [appsResponse, usageResponse] = await Promise.all([
          ApiService.getApplication(),
          ApiService.getUserCountAndEmailsByApplication()
        ]);

        // Save app list
        setAppList(appsResponse);

        // Build lookup table for usage stats by applicationName
        const usageMap = {};
        let totalEmailAccounts = 0;
        let totalUserCount = 0;

        usageResponse.forEach(entry => {
          const name = entry.applicationName;
          const emailCount = entry.numberOfEmailAccounts || 0;
          const userCount = entry.userCount || 0;
          const percentage = emailCount > 0 ? Math.round((userCount / emailCount) * 100) : 0;

          usageMap[name] = {
            active: userCount,
            total: emailCount,
            percentage
          };

          totalEmailAccounts += emailCount;
          totalUserCount += userCount;
        });

        usageMap['All Applications'] = {
          active: totalUserCount,
          total: totalEmailAccounts,
          percentage: totalEmailAccounts > 0
            ? Math.round((totalUserCount / totalEmailAccounts) * 100)
            : 0
        };

        setUsageStats(usageMap);
      } catch (error) {
        console.error('Error fetching applications or stats:', error);
      }
    };

    fetchStatsAndApps();
  }, []);


  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await ApiService.getUserAccountList({
          pageNumber: currentPage,
          pageSize: rowsPerPage
        });

        const flattenedUsers = response.data.flatMap(app =>
          app.users.map(user => ({
            ...user,
            app: app.applicationCode,
            appName: app.applicationName
          }))
        );

        //setUsers(flattenedUsers);
        setAllUsers(flattenedUsers); // ✅ ADD THIS LINE

        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await ApiService.getApplication();
        setFetchedApps(response); // [{applicationCode, applicationName, ...}]
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchApplications();
  }, []);

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
            {/* "All Applications" Card */}
            {usageStats['All Applications'] && (
              <div className="bg-red-50 rounded-xl shadow-sm p-4 lg:p-6 border border-red-500">
                <h3 className="text-gray-600 text-sm mb-4">All Applications</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full border-4 border-red-500 flex items-center justify-center text-red-500">
                    <span className="text-sm font-bold">{usageStats['All Applications'].percentage}%</span>
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                      {usageStats['All Applications'].active} / {usageStats['All Applications'].total}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic cards based on application list */}
            {appList.map(app => {
              const stat = usageStats[app.applicationName] || {
                active: 0,
                total: 0,
                percentage: 0
              };

              return (
                <div
                  key={app.applicationCode}
                  className="bg-gray-100 rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200"
                >
                  <h3 className="text-gray-600 text-sm mb-4">{app.applicationName}</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full border-4 border-gray-400 flex items-center justify-center text-gray-700">
                      <span className="text-sm font-bold">{stat.percentage}%</span>
                    </div>
                    <div>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                        {stat.active} / {stat.total}
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
              {/* Tabs from API */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>📱</span> All Applications
                </button>

                {!loadingApps &&
                  fetchedApps.map((app) => (
                    <button
                      key={app.applicationCode}
                      onClick={() => setActiveTab(app.applicationCode)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        activeTab === app.applicationCode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>📦</span> {app.applicationName}
                    </button>
                  ))}
              </div>
              {/* <div className="flex gap-2 flex-wrap">
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
              </div> */}
              
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
                      <td className="px-6 py-4 text-sm text-gray-600">{user.userEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.appName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.jobPosition}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createDate ? new Date(user.createDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.lastActive ? new Date(user.lastActive).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.lastUpdate ? new Date(user.lastUpdate).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.lastDeviceUsed || '-'}
                      </td>
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
                {loadingUsers ? (
                  <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : (
                  <table className="w-full">
                    {/* ...table structure... */}
                  </table>
                )}
              </table>
            </div>

            {/* Pagination - keeping your existing pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page on page size change
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={7}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-4">
                  {`Page ${currentPage} of ${totalPages}`} — {totalCount} total users
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  ‹
                </button>
                <span className="px-3 py-1">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  »
                </button>
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