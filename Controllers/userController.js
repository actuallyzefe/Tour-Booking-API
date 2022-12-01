const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const User = require('./../models/userModel');
const factory = require('./handlerFactory');

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

// DELETING USER DATA // INACTIVATING DATA

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
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

// IMPORTANT buradaki delete ve update fonksıyonları sadece admınler ıcındır yukarıdakılerde kullancı kendını databaseden silmez sadece deactive yapar
// veya update olarak da kendı şifresini vesaire update eder.
// IMPORTANT ALERT VE BUNUNLA PASSWORD KESINLIKLE UPDATE EDILMEMELIDIR
exports.deleteUser = factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);
