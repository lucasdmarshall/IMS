const express = require('express');
const settingsController = require('../controllers/settingsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware - requires authentication
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(settingsController.getSettings)
  .put(settingsController.updateSettings);

router
  .route('/reset')
  .post(settingsController.resetSettings);

module.exports = router;
