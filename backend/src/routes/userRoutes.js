const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Restrict to admin only
router.use(restrictTo('admin'));

// Get all users
router.get('/', userController.getAllUsers);

// Get a single user
router.get('/:id', userController.getUser);

// Create a new user
router.post('/', userController.createUser);

// Update a user
router.patch('/:id', userController.updateUser);

// Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
