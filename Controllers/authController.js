const jwt = require('jsonwebtoken'); // npm i jsonwebtoken
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
// async fonskıyonları normalde try catch blockuna yazarız normadle ama daha önceden yarattıgımız catchAsync ile errorlerı yazmakla ugrasmaadan catchliyorus
const appError = require('./../utils/appError');

// exports.signup = catchAsync(async (req, res, next) => {
// Data işlemi olacağından tabii ki async fonkısoyn kullanacagız
// const newUser = await User.create(req.body); // buranın hepsi bir promise dondurecegınden onları await ile aktif ediyorz.// create() fonksıyonu ile yeni bir öğe oluştuuryorduk
// bu yeni öğenin bilgiside request in içindeki body elemanında bulunuyor
// bunun aynısnı Tour.create() şeklinde yeni tur oluştururken yapmıştık

// IMPORTANT // DIKKAT
// yukarıda yaptımız tamamıyla dogurydu ama çok buuyk bır guvenlık acıgı vardı. onun yerine bunu kullanacagız:
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // PAYLOAD => token ın içinde bulunan ve dataları store ettıgımız bır object

  // burada jwt yaratıyoruz sign() içerisine ilk olarak payload kısmını yazıyoruz.

  // sign() içerisine yazılan 2.şey ise secret bölümüdür => minimum 32karakter uzunlugunda olması önerilir ne kadar uzun o kadar iyi. // bunu ister config dosyanda belirt ister " " içerisine yaz Biz Configde belirttik

  // sign() içreisine yazılan 3.şey ise optionlardır ve {} objectlerdir => yaratılan token ın geçerlilik süresi => bunu yine config dosyanda veya "" içerisnde belirteblirsin
  // d => days => m => minutes
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// Logging Users in => temelinde sign edilen token ın (yaratılan) kullancıya geri gödnerilip kullanıcının onu kullanmasıyla olusur

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new appError('Please provide an email or password'), 400);
  }
  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password'); //database e leak etmedik burada explcit olarak belirttik

  // 3) If everything ok, send token to client
  const token = '';
  res.status(200).json({
    status: 'Success',
    token,
  });
});
