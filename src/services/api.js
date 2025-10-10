import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7287';

class ApiService {
  constructor() {
    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for centralized error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle 401 Unauthorized - but exclude re-authentication endpoints
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          
          // Don't redirect to login for re-authentication failures
          if (url.includes('/api/ProfileSettings/re-authenticate')) {
            console.log('Re-authentication failed - not redirecting to login');
            return Promise.reject(error);
          }
          
          // Don't redirect for secure database connection failures
          if (url.includes('/api/ProfileSettings/secure-database-connection')) {
            console.log('Secure database connection access denied - not redirecting to login');
            return Promise.reject(error);
          }
          
          // Don't redirect for non-encrypted profile failures
          if (url.includes('/api/ProfileSettings/non-encrypted-profile')) {
            console.log('Non-encrypted profile access denied - not redirecting to login');
            return Promise.reject(error);
          }
          
          // For all other 401 errors, handle as session expiry
          this.handleAuthenticationError();
        }
        return Promise.reject(error);
      }
    );
  }

  // Handle authentication errors (401) - but only for main session issues
  handleAuthenticationError() {
    console.log('Main session authentication error - redirecting to login');
    
    // Clear tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
    localStorage.removeItem('rememberLogin');
    localStorage.removeItem('rememberEmail');
    
    // Clear browser history and redirect
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      // Use replace to prevent back navigation
      window.history.replaceState(null, null, '/login');
      window.location.replace('/login');
    }
  }

  // Helper method to make HTTP requests
  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: endpoint,
      };

      if (data) {
        config.data = data;
      }

      const response = await this.axiosInstance(config);
      
      // Return success response
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Unable to connect to server. Please check if the API server is running.',
          status: 0,
          isNetworkError: true,
        };
      }

      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        let errorMessage = 'An error occurred';
        
        // Handle different error status codes
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to access this resource.';
        } else if (error.response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        } else {
          // Handle your API response structure
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData && errorData.Message) {
            errorMessage = errorData.Message;
          } else if (errorData && errorData.title) {
            errorMessage = errorData.title;
          } else {
            errorMessage = `HTTP error! status: ${error.response.status}`;
          }
        }
        
        return {
          success: false,
          error: errorMessage,
          status: error.response.status,
          isAuthError: error.response.status === 401,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from server. Please check your connection.',
          status: 0,
          isNetworkError: true,
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || 'An unexpected error occurred.',
          status: 500,
        };
      }
    }
  }

  // Login API
  async login(email, password) {
    const result = await this.makeRequest('POST', '/api/Login/login', {
      Email: email,
      Password: password,
    });

    // Return the result without automatically storing data
    // Let the component handle multiple customers scenario
    return result;
  }

  // New method to select and store customer data
  selectCustomer(customerData, email) {
    // Store the authentication token
    if (customerData?.jwtToken) {
      localStorage.setItem('authToken', customerData.jwtToken);
    }
    
    // Store customer data
    const userData = {
      customerCode: customerData.customerCode,
      customerName: customerData.customerName,
      email: email,
      customers: [
        {
          customerCode: customerData.customerCode,
          customerName: customerData.customerName
        }
      ]
    };
    
    localStorage.setItem('customerData', JSON.stringify(userData));
  }

  // Send OTP for forgot password
  async sendForgotPasswordOTP(email) {
    return this.makeRequest('POST', '/api/Customer/send-password-reset-otp', {
      Email: email,
    });
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    return this.makeRequest('POST', '/api/Customer/verify-password-reset-otp', {
      Email: email,
      OTP: otp,
    });
  }

  // Reset password
  async resetPassword(email, newPassword, confirmPassword = null) {
    const requestData = {
      Email: email,
      NewPassword: newPassword,
    };

    if (confirmPassword !== null) {
      requestData.ConfirmPassword = confirmPassword;
    } else {
      requestData.ConfirmPassword = newPassword;
    }
    
    return this.makeRequest('POST', '/api/Customer/reset-password', requestData);
  }

  // ===== DEVICE LICENSE KEY METHODS =====
  
  // Get all device license keys for customer portal
  async getDeviceLicenseKeysForCustomerPortal(customerCode) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', `/api/DeviceLicenseKey/customer-portal/${customerCode}`);
  }

  // Get device license key statistics
  async getDeviceLicenseKeyStatistics(customerCode) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', `/api/DeviceLicenseKey/statistics/${customerCode}`);
  }

  // Search device license keys with filters and pagination
  async searchDeviceLicenseKeysWithFilters(filterData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('POST', '/api/DeviceLicenseKey/search-with-filters', filterData);
  }

  // Get single device license key details
  async getDeviceLicenseKeyDetails(deviceLicenseKeyCode) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', `/api/DeviceLicenseKey/details/${deviceLicenseKeyCode}`);
  }

  // ===== DEVICE LICENSE KEY APPROVAL METHODS =====
  
  // Customer approve device license key
  async customerApproveDeviceLicenseKey(deviceLicenseKeyCode, remarks = '') {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('POST', '/api/DeviceLicenseKey/customer/approve', {
      DeviceLicenseKeyCode: deviceLicenseKeyCode,
      Action: 'APPROVE',
      Remarks: remarks || 'Approved by customer'
    });
  }

  // Customer deny device license key
  async customerDenyDeviceLicenseKey(deviceLicenseKeyCode, remarks = '') {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('POST', '/api/DeviceLicenseKey/customer/deny', {
      DeviceLicenseKeyCode: deviceLicenseKeyCode,
      Action: 'DENY',
      Remarks: remarks || 'Denied by customer'
    });
  }

  // Get pending device license keys for customer
  async getPendingDeviceLicenseKeysForCustomer(customerCode) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', `/api/DeviceLicenseKey/customer/${customerCode}/pending`);
  }

  // ===== UTILITY METHODS =====

  // Logout
  async logout() {
    // Clear all authentication-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
    localStorage.removeItem('userPreferences');
    
    return { success: true };
  }

  getCurrentUser() {
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
      try {
        return JSON.parse(customerData);
      } catch (error) {
        localStorage.removeItem('customerData');
        return null;
      }
    }
    return null;
  }

  getCurrentCustomerCode() {
    const userData = this.getCurrentUser();
    
    if (userData) {
      if (userData.customers && userData.customers.length > 0) {
        return userData.customers[0].customerCode;
      }
      if (userData.customerCode) {
        return userData.customerCode;
      }
      if (userData.CustomerCode) {
        return userData.CustomerCode;
      }
      if (userData.Customer && userData.Customer.CustomerCode) {
        return userData.Customer.CustomerCode;
      }
    }
    
    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Set auth token (useful for login)
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
    console.log('[API] Auth token set manually');
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
    console.log('[API] Auth token removed');
  }

  // Get current auth token
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // ===== USER ACCOUNT MANAGEMENT METHODS =====
  async getApplication() {
    // Retrieve token from local storage
    const token = localStorage.getItem('authToken');

    // Set Authorization header for the axios instance
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Clear header if no token found
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    // Call makeRequest with GET method and endpoint
    const result = await this.makeRequest('get', '/api/CustomerGeneral/subscribe-applications');

    if (result.success) {
      return result.data;
    } else {
      // Optionally throw or handle the error here
      throw new Error(result.error);
    }
  }
  // Accept params for pagination and filtering
  async getUserAccountList({ pageNumber = 1, pageSize = 5 } = {}) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    const query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const result = await this.makeRequest('get', `/api/CustomerUserAccount/get-useraccount-list-by-customer${query}`);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  }

  async getUserCountAndEmailsByApplication() {
    // Retrieve token from local storage
    const token = localStorage.getItem('authToken');

    // Set Authorization header for the axios instance
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Clear header if no token found
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    // Call makeRequest with GET method and endpoint
    const result = await this.makeRequest('get', '/api/CustomerUserAccount/user-count-and-emails-by-application');

    if (result.success) {
      return result.data;
    } else {
      // Optionally throw or handle the error here
      throw new Error(result.error);
    }
  }

  // ===== PROFILE SETTINGS METHODS =====
  
  // Get encrypted customer profile
  async getEncryptedProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', '/api/ProfileSettings/encrypted-profile');
  }

  // Get customer profile (non-encrypted)
  async getProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', '/api/ProfileSettings/profile');
  }

  // Update customer profile
  async updateProfile(updateData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('PUT', '/api/ProfileSettings/update-profile', updateData);
  }

  // Get profile summary
  async getProfileSummary() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', '/api/ProfileSettings/profile-summary');
  }

  // Validate profile data
  async validateProfile(updateData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('POST', '/api/ProfileSettings/validate-profile', updateData);
  }

  // Re-authenticate user for accessing sensitive database connection information
  async reAuthenticate(email, password) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    // Use a special flag to identify this as a re-authentication request
    try {
      const config = {
        method: 'POST',
        url: '/api/ProfileSettings/re-authenticate',
        data: {
          Email: email,
          Password: password
        }
      };

      const response = await this.axiosInstance(config);
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
      
    } catch (error) {
      if (error.response?.status === 401) {
        // This is a re-authentication failure, not a session expiry
        const errorData = error.response.data;
        let errorMessage = 'Invalid credentials. Please check your password and try again.';
        
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.Message) {
          errorMessage = errorData.Message;
        } else if (errorData?.data?.message) {
          errorMessage = errorData.data.message;
        }
        
        return {
          success: false,
          error: errorMessage,
          status: 401,
          isReAuthError: true, // Special flag to indicate this is a re-auth error
        };
      }
      
      // For other errors, use the standard error handling
      return this.handleRequestError(error);
    }
  }

  // Get secure database connection details (requires valid temp access token)
  async getSecureDatabaseConnection(tempAccessToken) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    try {
      const config = {
        method: 'GET',
        url: `/api/ProfileSettings/secure-database-connection?tempAccessToken=${encodeURIComponent(tempAccessToken)}`
      };

      const response = await this.axiosInstance(config);
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
      
    } catch (error) {
      if (error.response?.status === 401) {
        // This is a token access denial, not a session expiry
        return {
          success: false,
          error: 'Access denied. Please re-authenticate to view database connection details.',
          status: 401,
          isAccessDenied: true, // Special flag
        };
      }
      
      return this.handleRequestError(error);
    }
  }

  // Get non-encrypted profile (requires valid temp access token)
  async getNonEncryptedProfile(tempAccessToken) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    try {
      const config = {
        method: 'GET',
        url: `/api/ProfileSettings/non-encrypted-profile?tempAccessToken=${encodeURIComponent(tempAccessToken)}`
      };

      const response = await this.axiosInstance(config);
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
      
    } catch (error) {
      if (error.response?.status === 401) {
        // This is a token access denial, not a session expiry
        return {
          success: false,
          error: 'Access denied. Please re-authenticate to view profile details.',
          status: 401,
          isAccessDenied: true, // Special flag
        };
      }
      
      return this.handleRequestError(error);
    }
  }

  // Helper method to handle request errors (extracted from makeRequest)
  handleRequestError(error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check if the API server is running.',
        status: 0,
        isNetworkError: true,
      };
    }

    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      let errorMessage = 'An error occurred';
      
      // Handle different error status codes
      if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to access this resource.';
      } else if (error.response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.response.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else {
        // Handle your API response structure
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData && errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData && errorData.title) {
          errorMessage = errorData.title;
        } else {
          errorMessage = `HTTP error! status: ${error.response.status}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.response.status,
        isAuthError: error.response.status === 401,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'No response from server. Please check your connection.',
        status: 0,
        isNetworkError: true,
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred.',
        status: 500,
      };
    }
  }

  // Extract applications from user account data
  async getUserApplicationsFromAccountData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    try {
      // Get user account data
      const result = await this.getUserAccountList({ pageNumber: 1, pageSize: 1000 });
      
      if (result?.data) {
        const applicationsMap = new Map();
        
        // Process each item in the API response data
        result.data.forEach(item => {
          // Add child application (the actual application with users)
          if (!applicationsMap.has(item.applicationCode)) {
            applicationsMap.set(item.applicationCode, {
              applicationCode: item.applicationCode,
              applicationName: item.applicationName,
              parentApplicationCode: item.parentApplicationCode,
              parentApplicationName: item.parentApplicationName,
              userCount: item.users?.length || 0,
              isChild: !!item.parentApplicationCode
            });
          }
          
          // Add parent application if it exists and hasn't been added yet
          if (item.parentApplicationCode && item.parentApplicationName && !applicationsMap.has(item.parentApplicationCode)) {
            applicationsMap.set(item.parentApplicationCode, {
              applicationCode: item.parentApplicationCode,
              applicationName: item.parentApplicationName,
              parentApplicationCode: null,
              parentApplicationName: null,
              userCount: 0, // Will be calculated below
              isChild: false
            });
          }
        });
        
        // Calculate user counts for parent applications
        applicationsMap.forEach((app, code) => {
          if (!app.parentApplicationCode) {
            // This is a parent app, count users from all child apps
            let totalUsers = 0;
            result.data.forEach(item => {
              if (item.parentApplicationCode === code) {
                totalUsers += item.users?.length || 0;
              }
            });
            app.userCount = totalUsers;
          }
        });
        
        const applications = Array.from(applicationsMap.values());
        
        console.log('Extracted applications from user account data:', applications);
        
        return {
          success: true,
          data: applications,
          status: 200,
        };
      } else {
        return {
          success: false,
          error: 'Failed to fetch user account data',
          status: 500,
        };
      }
    } catch (error) {
      console.error('Error extracting applications from user account data:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred.',
        status: 500,
      };
    }
  }

  // ===== ACTIVITY TRACKING METHODS =====
  
  // Get recent activities for dashboard
  async getRecentActivities(customerCode, limit = 10) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('GET', `/api/Activity/recent/${customerCode}?limit=${limit}`);
  }

  // Get activity logs with filters
  async getActivityLogs(customerCode, filters = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    const queryParams = new URLSearchParams({
      customerCode,
      ...filters
    }).toString();

    return this.makeRequest('GET', `/api/Activity/logs?${queryParams}`);
  }

  // Log activity (for frontend actions)
  async logActivity(activityData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required. Please log in again.',
        status: 401,
        isAuthError: true,
      };
    }

    return this.makeRequest('POST', '/api/Activity/log', activityData);
  }
}

export default new ApiService();