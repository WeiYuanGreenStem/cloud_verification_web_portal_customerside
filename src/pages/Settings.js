import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Database, 
  User, 
  Building2, 
  MapPin, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApiService from '../services/api';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Profile data states
  const [profileData, setProfileData] = useState(null);
  const [encryptedProfile, setEncryptedProfile] = useState(null);
  const [showDatabasePassword, setShowDatabasePassword] = useState(false);

  // Form data states
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    customerPhone: '',
    contactPerson: '',
  });

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    fetchProfileData();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('Fetching profile data...');

      // Fetch both regular and encrypted profile data
      const [profileResult, encryptedResult] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getEncryptedProfile()
      ]);

      console.log('Profile Result:', profileResult);
      console.log('Encrypted Result:', encryptedResult);

      // Handle regular profile data
      if (profileResult.success) {
        // Check if the response data has success property (your API structure)
        if (profileResult.data?.success === true) {
          const profile = profileResult.data.data;
          console.log('Profile data:', profile);
          setProfileData(profile);
          
          // Initialize form data
          setFormData({
            customerName: profile.customerName || '',
            customerEmail: profile.customerEmail || '',
            customerAddress: profile.customerAddress || '',
            customerPhone: profile.customerPhone || '',
            contactPerson: profile.contactPerson || '',
          });
        } else {
          const errorMessage = profileResult.data?.message || 'Failed to fetch profile data';
          console.log('Profile API error:', errorMessage);
          setError(errorMessage);
        }
      } else if (profileResult.status === 401 || profileResult.isAuthError) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        return;
      } else {
        const errorMessage = profileResult.error || 'Failed to fetch profile data';
        console.log('Profile request failed:', errorMessage);
        setError(errorMessage);
      }

      // Handle encrypted profile data
      if (encryptedResult.success) {
        if (encryptedResult.data?.success === true) {
          const encrypted = encryptedResult.data.data;
          console.log('Encrypted profile data:', encrypted);
          setEncryptedProfile(encrypted);
        } else {
          console.log('Encrypted profile API error:', encryptedResult.data?.message);
        }
      } else if (encryptedResult.status === 401 || encryptedResult.isAuthError) {
        // Handle auth error for encrypted profile
        console.log('Encrypted profile auth error');
      } else {
        console.log('Encrypted profile request failed:', encryptedResult.error);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('An unexpected error occurred while fetching profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Validate profile data first
      const validationResult = await ApiService.validateProfile(formData);
      
      if (validationResult.success && validationResult.data?.success === true) {
        const validation = validationResult.data.data;
        
        if (!validation.isValid) {
          setError('Profile validation failed: ' + (validation.validationErrors?.join(', ') || 'Invalid data'));
          return;
        }
      }

      // Update profile
      const result = await ApiService.updateProfile(formData);
      
      if (result.success && result.data?.success === true) {
        setSuccess('Profile updated successfully');
        // Refresh profile data
        await fetchProfileData();
      } else if (result.status === 401 || result.isAuthError) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        const errorMessage = result.error || result.data?.message || 'Failed to update profile';
        setError(errorMessage);
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      setError('An unexpected error occurred while saving profile');
    } finally {
      setIsSaving(false);
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
          title="Settings"
          subtitle="Manage your profile and system settings"
        />
        
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your profile and system preferences</p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Tabs */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveTab('company')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === 'company' 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 size={18} />
                      <span>Company Details</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('database')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === 'database' 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Database size={18} />
                      <span>Database Connection</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <User size={18} />
                      <span>Profile Settings</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Company Details Tab */}
                {activeTab === 'company' && profileData && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Building2 size={20} className="text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Company Details</h2>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Code
                          </label>
                          <input
                            type="text"
                            value={profileData.customerCode || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              profileData.statusName?.toLowerCase() === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {profileData.statusName || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <textarea
                            name="customerAddress"
                            value={formData.customerAddress}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Connection Tab */}
                {activeTab === 'database' && encryptedProfile && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Database size={20} className="text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Database Connection</h2>
                        <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Connected</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Server
                          </label>
                          <input
                            type="text"
                            value={encryptedProfile.encryptedDatabaseConnection?.encryptedDatabaseServer || 'N/A'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database
                          </label>
                          <input
                            type="text"
                            value={encryptedProfile.encryptedDatabaseConnection?.encryptedDatabaseName || 'N/A'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={encryptedProfile.encryptedDatabaseConnection?.encryptedDatabaseUsername || 'N/A'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showDatabasePassword ? 'text' : 'password'}
                              value={encryptedProfile.encryptedDatabaseConnection?.maskedDatabasePassword || 'N/A'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                              disabled
                            />
                            <button
                              type="button"
                              onClick={() => setShowDatabasePassword(!showDatabasePassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showDatabasePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Port
                          </label>
                          <input
                            type="text"
                            value={encryptedProfile.encryptedDatabaseConnection?.encryptedDatabasePort || 'N/A'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                      </div>
                      
                      {/* Encryption Notice */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Shield size={16} />
                          <span className="text-sm font-medium">Security Information</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Database credentials are encrypted using AES-256-GCM encryption for maximum security.
                        </p>
                        {encryptedProfile.metadata && (
                          <p className="text-xs text-blue-600 mt-2">
                            Last updated: {new Date(encryptedProfile.metadata.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Settings Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <User size={20} className="text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="mt-8 flex justify-end gap-4">
                        <button
                          onClick={fetchProfileData}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <RefreshCw size={16} />
                          Refresh
                        </button>
                        
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Data Message */}
                {!profileData && !encryptedProfile && !isLoading && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Profile Data</h3>
                    <p className="text-gray-600 mb-4">Unable to load profile information.</p>
                    <button
                      onClick={fetchProfileData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;