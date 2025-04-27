const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.patch('/update-me', protect, authController.updateCurrentUser);
router.patch('/update-password', protect, authController.updatePassword);

// Admin-only routes
router.route('/users')
  .get(protect, restrictTo('admin'), authController.getAllUsers)
  .post(protect, restrictTo('admin'), authController.createUser);

router.route('/users/:id')
  .get(protect, restrictTo('admin'), authController.getUser)
  .patch(protect, restrictTo('admin'), authController.updateUser)
  .delete(protect, restrictTo('admin'), authController.deleteUser);

module.exports = router;
