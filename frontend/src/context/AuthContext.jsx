import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.group('AuthContext Initial Authentication Check');
    console.log('Stored User:', storedUser);
    console.log('Token Exists:', !!token);

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        console.log('Parsed User:', {
          id: parsedUser.id,
          email: parsedUser.email,
          role: parsedUser.role
        });

        setUser(parsedUser);
        setIsAuthenticated(true);
        
        console.log('Authentication Status:', {
          isAuthenticated: true,
          userRole: parsedUser.role
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid stored data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.warn('No stored user or token found');
    }
    
    console.groupEnd();
  }, []);

  // Login method
  const login = (userData, token) => {
    console.group('AuthContext Login');
    console.log('Login called with:', { 
      userData, 
      token: token ? 'EXISTS' : 'NOT EXISTS' 
    });

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);

    console.log('Post-Login State:', {
      user: userData,
      isAuthenticated: true
    });

    // Redirect based on user role
    switch(userData.role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'manager':
        navigate('/manager/dashboard', { replace: true });
        break;
      case 'staff':
        navigate('/staff/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
    
    console.groupEnd();
  };

  // Logout method
  const logout = () => {
    console.group('AuthContext Logout');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
    console.groupEnd();
  };

  // Context value
  const contextValue = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
