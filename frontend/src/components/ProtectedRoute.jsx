import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'manager', 'staff'] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.group('ProtectedRoute Detailed Debug');
    
    // Retrieve user from localStorage if not in context
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    console.log('Authentication Context:', {
      user, 
      isAuthenticated, 
      allowedRoles, 
      currentPath: location.pathname
    });

    console.log('Local Storage Check:', {
      user: storedUser,
      token: storedToken ? 'EXISTS' : 'NOT EXISTS'
    });

    // Attempt to parse stored user
    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }

    console.groupEnd();

    // Set auth checked to prevent multiple redirects
    setAuthChecked(true);
  }, [user, isAuthenticated, location, allowedRoles]);

  // If authentication check is not complete, show nothing
  if (!authChecked) {
    return null;
  }

  // Check authentication and role
  const checkAccess = () => {
    console.group('Access Check');
    
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return false;
    }

    const userRole = parsedUser?.role;
    const hasAccess = allowedRoles.includes(userRole);

    console.log('Access Details:', {
      storedUser: !!storedUser,
      storedToken: !!storedToken,
      userRole,
      hasAccess,
      allowedRoles
    });

    console.groupEnd();

    return hasAccess;
  };

  // If not authenticated, redirect to login
  if (!localStorage.getItem('token')) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no access, redirect to access-denied page
  if (!checkAccess()) {
    console.log('Access Denied, redirecting to access-denied page');
    // Check if this is the settings page
    if (location.pathname === '/settings') {
      return <Navigate to="/access-denied" replace />;
    }
    
    // For other routes, redirect to appropriate dashboard
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    switch(storedUser?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If all checks pass, render children
  console.log('Access Granted');
  return children;
};

export default ProtectedRoute;
