const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const User = require('./../models/userModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
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
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError(
        'This route is not for update Passwords. Please try  /updateMyPassword',
        400
      )
    );
  }
  // 2) Update User Document
  const filteredBody = filterObj(req.body, 'name', 'email'); // burada sadece nelerin update edielceğine izin verceğimizi seçtik
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    // findByIdAndUpdatede de bunu kullandık
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: updatedUser,
  });
  next();
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
