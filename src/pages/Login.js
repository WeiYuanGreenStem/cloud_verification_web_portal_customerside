import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem('rememberLogin') === 'true';
    const rememberedEmail = localStorage.getItem('rememberEmail') || '';

    if (remembered) {
      setRememberMe(true);
      setEmail(rememberedEmail);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await ApiService.login(email, password);

      if (result.success) {
        // Store authentication data
        if (result.data && result.data.length > 0) {
          const firstCustomer = result.data[0];
          
          // Store JWT token
          localStorage.setItem('authToken', firstCustomer.JwtToken);
          
          // Store customer data
          localStorage.setItem('customerData', JSON.stringify({
            customers: result.data,
            email: email,
            loginTime: new Date().toISOString()
          }));

          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('rememberEmail', email);
          } else {
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('rememberEmail');
          }
          
          // Navigate to home page on successful login
          navigate('/home');
        } else {
          setError('Login successful but no customer data received.');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cloud Verification System
          </h1>
          <p className="text-gray-600">Sign in to manage your platform</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <a href="#" className="text-green-600 hover:text-green-700 ml-1">
              Contact Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;