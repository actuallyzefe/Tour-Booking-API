const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
// async fonskıyonları normalde try catch blockuna yazarız normadle ama daha önceden yarattıgımız catchAsync ile errorlerı yazmakla ugrasmaadan catchliyorus

exports.signup = catchAsync(async (req, res, next) => {
  // Data işlemi olacağından tabii ki async fonkısoyn kullanacagız
  const newUser = await User.create(req.body); // buranın hepsi bir promise dondurecegınden onları await ile aktif ediyorz.// create() fonksıyonu ile yeni bir öğe oluştuuryorduk
  // bu yeni öğenin bilgiside request in içindeki body elemanında bulunuyor
  // bunun aynısnı Tour.create() şeklinde yeni tur oluştururken yapmıştık

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
