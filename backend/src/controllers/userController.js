const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('Received request for getAllUsers');
  console.log('Requesting User:', {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });

  // Define query based on user role
  let query = {};
  switch (req.user.role) {
    case 'admin':
      // Admin sees all users
      break;
    case 'manager':
      // Manager sees staff and other managers
      query = { role: { $in: ['staff', 'manager'] } };
      break;
    case 'staff':
      // Staff sees only managers and other staff
      query = { role: { $in: ['staff', 'manager'] } };
      break;
    default:
      return next(new AppError('Unauthorized', 403));
  }

  const users = await User.find(query)
    .select('_id name email role active');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'staff' // Default to staff if no role specified
  });

  // Hide password from response
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: { user: newUser }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, role } = req.body;

  // Prevent password update through this route
  if (req.body.password) {
    return next(new AppError('This route is not for password updates', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id, 
    { name, email, role }, 
    { 
      new: true,  // Return updated document
      runValidators: true  // Run model validation
    }
  ).select('-password');

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getStaff = catchAsync(async (req, res, next) => {
  // Fetch only staff users
  const staff = await User.find({ role: 'staff' }).select('_id name email');
  
  res.status(200).json({
    status: 'success',
    results: staff.length,
    data: { 
      users: staff 
    }
  });
});
