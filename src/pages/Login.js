import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Users, User } from 'lucide-react';
import ApiService from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      navigate('/home', { replace: true });
      return;
    }

    const remembered = localStorage.getItem('rememberLogin') === 'true';
    const rememberedEmail = localStorage.getItem('rememberEmail') || '';

    if (remembered) {
      setRememberMe(true);
      setEmail(rememberedEmail);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login for:', email);
      const result = await ApiService.login(email, password);
      
      console.log('Login result:', result);
      
      const isSuccess = result.success && result.status === 200;

      if (isSuccess && Array.isArray(result.data)) {
        console.log('Login successful, customer count:', result.data.length);
        
        // Check if multiple customers exist
        if (result.data.length > 1) {
          console.log('Multiple customers detected, showing selection screen');
          // Multiple customers - show selection screen with flip animation
          setCustomers(result.data);
          setIsFlipping(true);
          
          // Trigger flip animation after a brief moment
          setTimeout(() => {
            setShowCustomerSelection(true);
            setIsFlipping(false);
          }, 150);
          
        } else if (result.data.length === 1) {
          console.log('Single customer detected, proceeding with login');
          // Single customer - proceed directly with login
          ApiService.selectCustomer(result.data[0], email);
          
          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('rememberEmail', email);
          } else {
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('rememberEmail');
          }
          
          handleSuccessfulLogin();
        } else {
          setError('No customer data found. Please contact administrator.');
        }
      } else {
        const errorMessage = result.error || 
                           result.data?.Message || 
                           result.data?.message || 
                           'Login failed. Please check your credentials and try again.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    console.log('Customer selected:', customer);
    setIsLoading(true);
    
    // Store selected customer data
    ApiService.selectCustomer(customer, email);
    
    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberLogin', 'true');
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberLogin');
      localStorage.removeItem('rememberEmail');
    }
    
    handleSuccessfulLogin();
  };

  const handleSuccessfulLogin = () => {
    // Wait a moment for localStorage to be updated
    setTimeout(() => {
      const isNowAuthenticated = ApiService.isAuthenticated();
      
      if (isNowAuthenticated) {
        console.log('Authentication successful, navigating to home');
        // Clear form
        if (!showCustomerSelection) {
          setEmail('');
          setPassword('');
        }
        
        // Navigate to home and replace history to prevent back navigation to login
        navigate('/home', { replace: true });
      } else {
        console.error('Authentication check failed after login');
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    }, 100);
  };

  const handleBackToLogin = () => {
    console.log('Going back to login screen');
    setIsFlipping(true);
    
    setTimeout(() => {
      setShowCustomerSelection(false);
      setCustomers([]);
      setIsFlipping(false);
      setError('');
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Card Container with Flip Animation */}
        <div 
          className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
            showCustomerSelection ? 'rotate-y-180' : ''
          } ${isFlipping ? 'pointer-events-none' : ''}`}
        >
          {/* Login Form Card (Front) */}
          <div className={`w-full backface-hidden ${showCustomerSelection ? 'rotate-y-180' : ''}`}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full">
              {/* Header Section */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <img 
                    src="/greenstem_logo.png" 
                    alt="GreenStem Logo" 
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center" 
                    style={{display: 'none'}}
                  >
                    <div className="text-white text-2xl font-bold">CV</div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">
                  Cloud Verification System
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Sign in to manage your platform</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm break-words">
                  {error}
                </div>
              )}
              
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{showCustomerSelection ? 'Logging In...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 break-words">
                  Don't have an account?{' '}
                  <a href="#" className="text-green-600 hover:text-green-700 hover:underline">
                    Contact Admin
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Selection Card (Back) */}
          <div className={`absolute inset-0 w-full backface-hidden rotate-y-180`}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full min-h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start mb-6">
                <button
                  onClick={handleBackToLogin}
                  className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">Select Account</h2>
                  <p className="text-gray-600 text-sm sm:text-base break-words">Choose which account to access</p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="mb-6">
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Users size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    Multiple accounts found for this email. Please select one to continue.
                  </span>
                </div>
              </div>

              {/* Customer List */}
              <div className="flex-1 min-h-0">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {customers.map((customer, index) => (
                    <button
                      key={customer.customerCode}
                      onClick={() => handleCustomerSelect(customer)}
                      disabled={isLoading}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors truncate">
                            {customer.customerName}
                          </h3>
                        </div>
                        <div className="text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0">
                          <User size={20} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600 text-sm">Logging in...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;