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
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          this.handleAuthenticationError();
        }
        return Promise.reject(error);
      }
    );
  }

  // Handle authentication errors (401)
  handleAuthenticationError() {
    console.log('[API] Handling authentication error - clearing tokens');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
    
    // Redirect to login page if not already there
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      console.log('[API] Redirecting to login page');
      window.location.href = '/login';
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

      console.log(`[API] Making ${method} request to: ${endpoint}`);
      const response = await this.axiosInstance(config);
      
      // Return success response
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
      
    } catch (error) {
      console.error(`[API] Error in ${method} ${endpoint}:`, error);
      
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

  // Login API - Enhanced to better handle token storage
  async login(email, password) {
    const result = await this.makeRequest('POST', '/api/Login/login', {
      Email: email,
      Password: password,
    });

    // If login is successful, store the token and user data
    if (result.success && result.data?.Success) {
      const loginData = result.data.Data;
      
      // Store the authentication token
      if (loginData?.Token) {
        localStorage.setItem('authToken', loginData.Token);
      }
      
      // Store customer data
      if (loginData?.Customer) {
        localStorage.setItem('customerData', JSON.stringify(loginData.Customer));
      }
    }

    return result;
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

    console.log('[API] Reset Password Request Data:', requestData);
    
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

  // ===== EXISTING METHODS =====

  // Logout
  async logout() {
    console.log('[API] Logging out - clearing tokens');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
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
}

export default new ApiService();