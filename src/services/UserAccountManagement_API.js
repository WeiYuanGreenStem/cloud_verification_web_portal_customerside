// import axios from 'axios';
// import {API_BASE_URL} from '../services/api';

// class ApiService {
//   constructor() {
//     // Create axios instance with base configuration
//     this.axiosInstance = axios.create({
//       baseURL: API_BASE_URL,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       timeout: 10000, // 10 seconds timeout
//     });

//     // Request interceptor to add auth token
//     this.axiosInstance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );

//     // Response interceptor for centralized error handling
//     this.axiosInstance.interceptors.response.use(
//       (response) => {
//         return response;
//       },
//       (error) => {
//         // Handle 401 Unauthorized - Token expired or invalid
//         if (error.response?.status === 401) {
//           this.handleAuthenticationError();
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   // Handle authentication errors (401)
//   handleAuthenticationError() {
//     console.log('[API] Handling authentication error - clearing tokens');
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('customerData');
    
//     // Redirect to login page if not already there
//     if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
//       console.log('[API] Redirecting to login page');
//       window.location.href = '/login';
//     }
//   }

//   // Helper method to make HTTP requests
//   async makeRequest(method, endpoint, data = null) {
//     try {
//       const config = {
//         method,
//         url: endpoint,
//       };

//       if (data) {
//         config.data = data;
//       }

//       console.log(`[API] Making ${method} request to: ${endpoint}`);
//       const response = await this.axiosInstance(config);
      
//       // Return success response
//       return {
//         success: true,
//         data: response.data,
//         status: response.status,
//       };
      
//     } catch (error) {
//       console.error(`[API] Error in ${method} ${endpoint}:`, error);
      
//       if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
//         return {
//           success: false,
//           error: 'Unable to connect to server. Please check if the API server is running.',
//           status: 0,
//           isNetworkError: true,
//         };
//       }

//       if (error.response) {
//         // Server responded with error status
//         const errorData = error.response.data;
//         let errorMessage = 'An error occurred';
        
//         // Handle different error status codes
//         if (error.response.status === 401) {
//           errorMessage = 'Authentication failed. Please log in again.';
//         } else if (error.response.status === 403) {
//           errorMessage = 'Access denied. You do not have permission to access this resource.';
//         } else if (error.response.status === 404) {
//           errorMessage = 'The requested resource was not found.';
//         } else if (error.response.status === 500) {
//           errorMessage = 'Internal server error. Please try again later.';
//         } else {
//           // Handle your API response structure
//           if (errorData && errorData.message) {
//             errorMessage = errorData.message;
//           } else if (errorData && errorData.Message) {
//             errorMessage = errorData.Message;
//           } else if (errorData && errorData.title) {
//             errorMessage = errorData.title;
//           } else {
//             errorMessage = `HTTP error! status: ${error.response.status}`;
//           }
//         }
        
//         return {
//           success: false,
//           error: errorMessage,
//           status: error.response.status,
//           isAuthError: error.response.status === 401,
//         };
//       } else if (error.request) {
//         // Request was made but no response received
//         return {
//           success: false,
//           error: 'No response from server. Please check your connection.',
//           status: 0,
//           isNetworkError: true,
//         };
//       } else {
//         // Something else happened
//         return {
//           success: false,
//           error: error.message || 'An unexpected error occurred.',
//           status: 500,
//         };
//       }
//     }
//   }

//   async getApplication() {
//     // Retrieve token from local storage
//     const token = localStorage.getItem('authToken');

//     // Set Authorization header for the axios instance
//     if (token) {
//       this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//       // Clear header if no token found
//       delete this.axiosInstance.defaults.headers.common['Authorization'];
//     }

//     // Call makeRequest with GET method and endpoint
//     const result = await this.makeRequest('get', '/api/CustomerGeneral/subscribe-applications');

//     if (result.success) {
//       return result.data;
//     } else {
//       // Optionally throw or handle the error here
//       throw new Error(result.error);
//     }
//   }
//   // Accept params for pagination and filtering
//   async getUserAccountList({ pageNumber = 1, pageSize = 10 } = {}) {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//       delete this.axiosInstance.defaults.headers.common['Authorization'];
//     }

//     const query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
//     const result = await this.makeRequest('get', `/api/CustomerUserAccount/get-useraccount-list-by-customer${query}`);

//     if (result.success) {
//       return result.data;
//     } else {
//       throw new Error(result.error);
//     }
//   }

// }

// export default new ApiService();