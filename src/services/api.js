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
        console.log('Making API request to:', config.baseURL + config.url);
        console.log('Request data:', config.data);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for centralized error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log the full response for debugging
        console.log('API Response:', response.data);
        
        return response; // Return the axios response object directly
      },
      (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error); // Let the error be handled in makeRequest
      }
    );
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
      console.error('API Error in makeRequest:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Unable to connect to server. Please check if the API server is running.',
          status: 0,
        };
      }

      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        let errorMessage = 'An error occurred';
        
        // Handle your API response structure
        if (errorData && errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData && errorData.title) {
          errorMessage = errorData.title;
        } else {
          errorMessage = `HTTP error! status: ${error.response.status}`;
        }
        
        return {
          success: false,
          error: errorMessage,
          status: error.response.status,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from server. Please check your connection.',
          status: 0,
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
    return this.makeRequest('POST', '/api/Login/login', {
      Email: email,
      Password: password,
    });
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

  // Reset password - Updated to match your ResetPasswordRequestDto structure
  async resetPassword(email, newPassword, confirmPassword = null) {
    // If confirmPassword is not provided, use newPassword (for backward compatibility)
    const requestData = {
      Email: email,
      NewPassword: newPassword,
    };

    // Add ConfirmPassword if your DTO requires it
    if (confirmPassword !== null) {
      requestData.ConfirmPassword = confirmPassword;
    } else {
      requestData.ConfirmPassword = newPassword; // Assume they match if not provided separately
    }

    console.log('Reset Password Request Data:', requestData);
    
    return this.makeRequest('POST', '/api/Customer/reset-password', requestData);
  }

  // Get requests example (for future use)
  async getCustomers() {
    return this.makeRequest('GET', '/api/customers');
  }

  // PUT request example (for future use)
  async updateCustomer(customerId, customerData) {
    return this.makeRequest('PUT', `/api/customers/${customerId}`, customerData);
  }

  // DELETE request example (for future use)
  async deleteCustomer(customerId) {
    return this.makeRequest('DELETE', `/api/customers/${customerId}`);
  }

  // Logout
  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
    return { success: true };
  }

  // Get current user info
  getCurrentUser() {
    const customerData = localStorage.getItem('customerData');
    return customerData ? JSON.parse(customerData) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Set auth token (useful for login)
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

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
    const result = await this.makeRequest('get', '/api/subscribe-applications');

    if (result.success) {
      return result.data;
    } else {
      // Optionally throw or handle the error here
      throw new Error(result.error);
    }
  }
}

export default new ApiService();