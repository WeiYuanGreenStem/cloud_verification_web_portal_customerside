import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = ApiService.isAuthenticated();

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        // Handle browser back/forward navigation
        const handlePopState = () => {
            if (!ApiService.isAuthenticated()) {
                // If not authenticated, redirect to login
                navigate('/login', { replace: true });
            }
            // If authenticated, allow normal navigation between protected pages
            // No need to prevent back navigation within protected routes
        };

        // Only prevent going back to login/public routes
        const currentPath = window.location.pathname;
        const protectedPaths = ['/home', '/devices', '/users'];
        
        if (protectedPaths.includes(currentPath)) {
            // Listen for back button only to check authentication
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;