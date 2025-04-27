const AppError = require('../utils/appError');

// Mock settings data (in a real app, this would be stored in a database)
let systemSettings = {
  companyName: 'Inventory Management System',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  lowStockThreshold: 10,
  enableNotifications: true,
  enableDebugMode: false,
  defaultLanguage: 'en',
  sessionTimeout: 30,
  backupFrequency: 'daily',
  lastUpdated: new Date().toISOString()
};

/**
 * Get all system settings
 * @route GET /api/v1/settings
 * @access Private (Admin only)
 */
exports.getSettings = (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: systemSettings
    });
  } catch (error) {
    next(new AppError('Error fetching settings', 500));
  }
};

/**
 * Update system settings
 * @route PUT /api/v1/settings
 * @access Private (Admin only)
 */
exports.updateSettings = (req, res, next) => {
  try {
    // In a real app, validate the input data
    const updatedSettings = {
      ...systemSettings,
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    // Update the settings
    systemSettings = updatedSettings;
    
    res.status(200).json({
      status: 'success',
      data: systemSettings
    });
  } catch (error) {
    next(new AppError('Error updating settings', 500));
  }
};

/**
 * Reset system settings to defaults
 * @route POST /api/v1/settings/reset
 * @access Private (Admin only)
 */
exports.resetSettings = (req, res, next) => {
  try {
    // Reset to default settings
    systemSettings = {
      companyName: 'Inventory Management System',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      lowStockThreshold: 10,
      enableNotifications: true,
      enableDebugMode: false,
      defaultLanguage: 'en',
      sessionTimeout: 30,
      backupFrequency: 'daily',
      lastUpdated: new Date().toISOString()
    };
    
    res.status(200).json({
      status: 'success',
      data: systemSettings
    });
  } catch (error) {
    next(new AppError('Error resetting settings', 500));
  }
};
