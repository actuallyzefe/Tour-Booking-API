const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const User = require('./../models/userModel');

// USERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'Success',
    results: users.lenght,
    data: {
      users,
    },
  });
});
exports.getSpesificUser = (req, res) => {
  res.status(500).json({
    status: 'ERROR',
    message: 'This route not implemented',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'ERROR',
    message: 'This route not implemented',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'ERROR',
    message: 'This route not implemented',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'ERROR',
    message: 'This route not implemented',
  });
};
