import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import ApiService from '../services/api';
import LogoutConfirmModal from './LogoutConfirmModal';

const Header = ({ toggleSidebar, title, subtitle }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  const currentUser = ApiService.getCurrentUser();
  const customerName = currentUser?.customerName || 'Customer';

  // Trigger animation when component mounts or customer name changes
  useEffect(() => {
    setNameVisible(false);
    const timer = setTimeout(() => {
      setNameVisible(true);
    }, 300); // Small delay before starting the animation

    return () => clearTimeout(timer);
  }, [customerName]);

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    navigate('/settings');
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // Clear all authentication data
      await ApiService.logout();
      
      // Navigate to login and replace history to prevent back navigation
      navigate('/login', { replace: true });
      
      // Additional security: Clear browser history and force navigation
      window.history.replaceState(null, null, '/login');
      
    } catch (error) {
      // Force navigation even if logout fails
      navigate('/login', { replace: true });
      window.history.replaceState(null, null, '/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };


  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          
          {/* Welcome Message in Header */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome to Cloud Verification System, {' '}
              <span 
                className={`transform transition-all duration-1000 ease-in-out ${
                  nameVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                {customerName}
              </span>
            </h1>
          </div>

          {/* Mobile Welcome Message */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-gray-800">
              Welcome {' '}
              <span 
                className={`transition-opacity duration-1000 ease-in-out ${
                  nameVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {customerName}
              </span>
            </h1>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile Menu"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Customer Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{customerName}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isLoading={isLoggingOut}
      />

      {/* Overlay to close profile menu when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
};

export default Header;