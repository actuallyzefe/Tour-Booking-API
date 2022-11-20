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

// UPDATING USER DATA
exports.updateMe = (req, res, next) => {
  // 1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return new appError(
      'This route is not for update Passwords. Please try  /updateMyPassword',
      400
    );
  }
  // 2) Update User Document
  res.status(200).json({
    status: 'Success',
  });
};

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
