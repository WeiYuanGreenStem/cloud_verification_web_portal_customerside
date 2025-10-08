import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ApiService from '../services/api';

const PublicRoute = ({ children }) => {
  const isAuthenticated = ApiService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      // If user is authenticated and tries to access public routes,
      // prevent them from going back to login
      const handlePopState = () => {
        if (ApiService.isAuthenticated()) {
          // Redirect back to home if they try to go back to login
          window.history.pushState(null, null, '/home');
          window.location.replace('/home');
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    // Redirect to home if already authenticated
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default PublicRoute;