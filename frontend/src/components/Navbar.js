import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axiosConfig';
import { 
  Home, Package, Users, ShoppingCart, 
  Bell, User, Settings, LogOut,
  Moon, Sun, Globe, Layers, 
  FileText, Truck, ClipboardList, BarChart2, Barcode, QrCode 
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../utils/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'my', name: 'မြန်မာ', nativeName: 'Burmese' }
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  // Centralized error handling
  const handleError = (error, context = 'General') => {
    console.error(`[${context} Error]:`, error.message);
    // Optional: Add toast or snackbar notification
  };

  // Safe JSON parsing
  const safeJSONParse = (item, defaultValue = null) => {
    try {
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      handleError(error, 'JSON Parsing');
      return defaultValue;
    }
  };

  // Memoized notification fetching
  const fetchNotifications = useCallback(async () => {
    try {
      console.log('Fetching notifications...', {
        baseURL: axiosInstance.defaults.baseURL,
        fullURL: `${axiosInstance.defaults.baseURL}/debug-notifications`
      });

      const response = await axiosInstance.get('/debug-notifications', {
        params: { 
          limit: 10,
          unreadOnly: 'true'  // Explicitly set as string
        },
        // Add timeout and explicit error handling
        timeout: 5000,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Default
        }
      });

      console.log('Notification Response:', {
        status: response.status,
        data: response.data
      });

      // Explicitly handle different response structures
      const data = response.data;
      const notifications = data.data?.notifications || data.notifications || [];
      let unreadCount = data.data?.unreadCount || data.unreadCount || 0;

      console.log('Fetched Notifications:', notifications);

      // Retrieve read notifications from local storage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
      console.log('Read Notifications from Local Storage:', readNotifications);

      // Update notifications state to reflect read status and recalculate unread count
      const updatedNotifications = notifications.map(notification => {
        const isAlreadyRead = readNotifications.includes(notification._id);
        if (isAlreadyRead && !notification.isRead) {
          unreadCount = Math.max(0, unreadCount - 1); // Adjust unread count
        }
        return isAlreadyRead ? { ...notification, isRead: true } : notification;
      });

      console.log('Updated Notifications with Read Status:', updatedNotifications);
      console.log('Recalculated Unread Count:', unreadCount);

      setNotifications(updatedNotifications);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('FULL Notification Fetch Error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        config: error.config,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        }
      });
      handleError(error, 'Notification Fetch');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  // Mark notification as read with error handling
  const markNotificationAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      // For all notifications, update local state immediately
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? {...n, isRead: true} : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('Updated unread count in state');
      
      // Save to localStorage for persistence across page refreshes
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
        console.log('Saved notification to localStorage:', notificationId);
      }
      
      // For real notifications (not debug), make API call
      if (notificationId !== '000000000000000000000001') {
        await axiosInstance.patch('/notifications/read', { 
          notificationIds: [notificationId] 
        });
        // Don't call fetchNotifications() here as we've already updated the UI
      } else {
        console.log('Debug notification handled locally');
      }
    } catch (error) {
      handleError(error, 'Mark Notification Read');
    }
  };

  // Initialization and periodic updates
  useEffect(() => {
    // Set initial language and theme
    document.body.setAttribute('lang', currentLanguage);
    document.body.classList.toggle('dark', isDarkMode);

    // Parse user safely
    const storedUser = safeJSONParse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    // Theme persistence
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      document.body.classList.toggle('dark', isDark);
    }

    // Ensure localStorage has a readNotifications array even if empty
    if (!localStorage.getItem('readNotifications')) {
      localStorage.setItem('readNotifications', JSON.stringify([]));
      console.log('Initialized empty readNotifications in localStorage');
    }

    // Debug: Log current localStorage state
    console.log('Current localStorage state:', {
      readNotifications: localStorage.getItem('readNotifications'),
      theme: localStorage.getItem('theme'),
      user: localStorage.getItem('user') ? 'EXISTS' : 'NOT EXISTS',
      token: localStorage.getItem('token') ? 'EXISTS' : 'NOT EXISTS'
    });

    // Notification setup
    if (storedUser) {
      fetchNotifications();
      const notificationInterval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(notificationInterval);
    }
  }, [currentLanguage, fetchNotifications]);

  const logClick = (action, details = {}) => {
    console.group('Navbar Click Event');
    console.log('Action:', action);
    console.log('User Details:', user ? {
      id: user.id,
      email: user.email,
      role: user.role
    } : 'No User');
    console.log('Additional Details:', details);
    console.log('Current Path:', window.location.pathname);
    console.log('Local Storage:', {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token') ? 'EXISTS' : 'NOT EXISTS'
    });
    console.groupEnd();
  };

  const handleLanguageChange = (languageCode) => {
    logClick('Language Change', { languageCode });
    i18n.changeLanguage(languageCode);
    setCurrentLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    document.body.setAttribute('lang', languageCode);
    setIsLanguageDropdownOpen(false);
  };

  const toggleTheme = () => {
    logClick('Theme Toggle', { newTheme: !isDarkMode });
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.body.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logClick('Logout Initiated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderNavLinks = () => {
    if (!user) return null;

    switch(user.role) {
      case 'admin':
        return (
          <>
            <Link 
              to="/admin/dashboard" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Admin Dashboard Click')}
            >
              <Home className="mr-2" size={20} />
              {t('dashboard')}
            </Link>
            <Link 
              to="/admin/products" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Products Click', { userRole: user.role })}
            >
              <Package className="mr-2" size={20} />
              {t('products')}
            </Link>
            <Link 
              to="/admin/stock" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Stock Management Click', { userRole: user.role })}
            >
              <Layers className="mr-2" size={20} />
              {t('stock')}
            </Link>
            <Link 
              to="/admin/orders" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Orders Management Click', { userRole: user.role })}
            >
              <FileText className="mr-2" size={20} />
              {t('orders')}
            </Link>
            <Link 
              to="/admin/users" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Users Click')}
            >
              <Users className="mr-2" size={20} />
              {t('users')}
            </Link>
            <Link 
              to="/admin/purchase-orders-suppliers" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Purchase Orders & Suppliers Click')}
            >
              <ClipboardList className="mr-2" size={20} />
              {t('purchase_orders_suppliers')}
            </Link>
            <Link 
              to="/admin/analysis" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Reports & Analysis Click')}
            >
              <BarChart2 className="mr-2" size={20} />
              {t('analysis')}
            </Link>
          </>
        );
      case 'manager':
        return (
          <>
            <Link 
              to="/manager/dashboard" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Manager Dashboard Click')}
            >
              <Home className="mr-2" size={20} />
              {t('dashboard')}
            </Link>
            <Link 
              to="/manager/products" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Manager Products Click')}
            >
              <Package className="mr-2" size={20} />
              {t('products')}
            </Link>
            <Link 
              to="/manager/stock" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Stock Management Click', { userRole: user.role })}
            >
              <Layers className="mr-2" size={20} />
              {t('stock')}
            </Link>
            <Link 
              to="/manager/orders" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Manager Orders Click', { userRole: user.role })}
            >
              <FileText className="mr-2" size={20} />
              {t('orders')}
            </Link>
            <Link 
              to="/manager/sales" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Sales Management Click', { userRole: user.role })}
            >
              <ShoppingCart className="mr-2" size={20} />
              {t('sales')}
            </Link>
            <Link 
              to="/manager/purchase-orders-suppliers" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Purchase Orders & Suppliers Click')}
            >
              <ClipboardList className="mr-2" size={20} />
              {t('purchase_orders_suppliers')}
            </Link>
            <Link 
              to="/manager/analysis" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Reports & Analysis Click')}
            >
              <BarChart2 className="mr-2" size={20} />
              {t('analysis')}
            </Link>
          </>
        );
      case 'staff':
        return (
          <>
            <Link 
              to="/staff/dashboard" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Staff Dashboard Click')}
            >
              <Home className="mr-2" size={20} />
              {t('dashboard')}
            </Link>
            <Link 
              to="/staff/products" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Staff Products Click')}
            >
              <Package className="mr-2" size={20} />
              {t('products')}
            </Link>
            <Link 
              to="/staff/stock" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Stock View Click', { userRole: user.role })}
            >
              <Layers className="mr-2" size={20} />
              {t('stock')}
            </Link>
            <Link 
              to="/staff/orders" 
              className="flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              onClick={() => logClick('Staff Orders View Click', { userRole: user.role })}
            >
              <FileText className="mr-2" size={20} />
              {t('orders')}
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  // Notification Dropdown with enhanced error handling
  const NotificationDropdown = () => {
    if (!notifications.length) {
      return (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-4 text-center text-gray-400">
          No notifications available
        </div>
      );
    }

    return (
      <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <span className="text-white font-semibold">Notifications</span>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div 
              key={notification._id || notification.id} 
              className={`px-4 py-3 hover:bg-gray-700 cursor-pointer ${
                !notification.isRead ? 'bg-gray-700/30' : ''
              }`}
              onClick={() => markNotificationAsRead(notification._id)}
            >
              <div className="flex items-start">
                <div className="flex-grow">
                  <p className="text-white text-sm">
                    {notification.content || 'No description'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {notification.createdAt 
                      ? new Date(notification.createdAt).toLocaleString() 
                      : 'Unknown time'}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-lg border-b border-gray-700/50"
    >
      <div className="w-full px-2">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link 
              to={
                user?.role === 'admin' ? '/admin/dashboard' :
                user?.role === 'manager' ? '/manager/dashboard' :
                user?.role === 'staff' ? '/staff/dashboard' : 
                '/login'
              } 
              className="text-xl font-bold text-dark-foreground mr-6"
              onClick={() => logClick('Logo Click')}
            >
              {t('inventory')}
            </Link>
            <div className="flex space-x-4">
              {renderNavLinks()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="navbar-icons">
              <button onClick={toggleTheme} title="Toggle Dark Mode">
                {isDarkMode ? <Sun className="navbar-icon" style={{ color: 'white' }} /> : <Moon className="navbar-icon" style={{ color: 'white' }} />}
              </button>
            </div>
            <div className="navbar-icons">
              <button 
                onClick={() => alert("Barcode scanner feature is still in development")}
                title="Scan Products"
                className="bg-transparent border-0 p-0 cursor-pointer"
              >
                <QrCode className="navbar-icon" style={{ color: 'white' }} />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex items-center"
              >
                <Globe size={20} className="mr-1" />
                <span className="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1 divide-y divide-gray-700">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`
                          w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200
                          ${currentLanguage === lang.code 
                            ? 'bg-dark-300 text-dark-foreground' 
                            : 'text-dark-muted hover:bg-dark-300'}
                        `}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="text-gray-300 hover:text-white relative"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationDropdownOpen && <NotificationDropdown />}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5">
                  <div className="p-2 border-b border-gray-700">
                    <p className="text-gray-300 text-sm">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700/50 rounded-md transition-colors"
                    >
                      <LogOut className="mr-2" size={16} /> {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
