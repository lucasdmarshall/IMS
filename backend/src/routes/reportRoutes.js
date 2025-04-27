const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Debug route to test if the router is working
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Report routes are working'
  });
});

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Get a specific report by type
router.get('/:type', reportController.getReport);

// Create or update a report (admin only)
router.post('/', 
  authMiddleware.restrictTo('admin'), 
  reportController.createOrUpdateReport
);

// Get all report types (admin only)
router.get('/', 
  authMiddleware.restrictTo('admin'), 
  reportController.getAllReportTypes
);

module.exports = router;
