const jwt = require('jsonwebtoken'); // npm i jsonwebtoken
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
// async fonskıyonları normalde try catch blockuna yazarız normadle ama daha önceden yarattıgımız catchAsync ile errorlerı yazmakla ugrasmaadan catchliyorus
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

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
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // PAYLOAD => token ın içinde bulunan ve dataları store ettıgımız bır object

  // burada jwt yaratıyoruz sign() içerisine ilk olarak payload kısmını yazıyoruz.

  // sign() içerisine yazılan 2.şey ise secret bölümüdür => minimum 32karakter uzunlugunda olması önerilir ne kadar uzun o kadar iyi. // bunu ister config dosyanda belirt ister " " içerisine yaz Biz Configde belirttik

  // sign() içreisine yazılan 3.şey ise optionlardır ve {} objectlerdir => yaratılan token ın geçerlilik süresi => bunu yine config dosyanda veya "" içerisnde belirteblirsin
  // d => days => m => minutes

  // daha fazlaca kullancagımı ıcın burayı comment out yapıp bir tokenGeneraor fonskıyonu yazdık (top level )
  const token = signToken(newUser._id);
  // jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

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
  // const correct = await user.correctPassword(password, user.password); //

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password'), 401);
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

// LESSON PROTECTED ROUTES
// UYE GIRISI YAPMAMIS KULLANICILARIN TUM TURLARI GORUNTULEMESINI ISTEMIYORUZ => .getAllTours
// ALERT bunun içinde bir middleware kullanıyoruz

// YAPTIGIMIZ SEY ISE postman DE authorization headerının valuesunu Bearer boşluk token olarak yaptık
// böylelikle üye olmadan tüm turları görüntüleyeemeyceklerdi

//1) Getting token and check if it exists
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') // burada token kontrolu yapabilmek için Bearer ı kullandık
    // Eğeer ki bunların 2side mevcutsa token tanımlanacak
  ) {
    token = req.headers.authorization.split(' ')[1]; // Auth valuesu postmnada Bearer ve Token şeklindeydi Boşlukla ayrılanları alıp arrye koyduk ve  arrayın 2. elemaını seçtik(orijinal tokeny)
  }

  if (!token) {
    return next(
      new appError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // console.log(token);

  //2) Verification token => TOKEN IN DOGRULAMASINI YAPIYORUZ YANI HERHANGI BIRI TOKEN DA BIR OYNAMA YAPMIS MI VESAIRE
  // LESSON burada ise JWT nin verify methodunu kullanacagız jwt.sign ın aksine verify => 3. parametre olarak bir CB fonksıyon alır
  // BU CB verification tamamlandıktan hemen sonra çalışır

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
    () => {}
  ); // ALERT bu fonksyıon aslında callback ıcerdıgınden dolayı async bir fonksıyon
  // buraya kadar promiseler ile ugrastıgımızdan bu pattern i bozmaya gerek yok bunu da async await ile kullanabilmek için promisfy yapabiliriz
  // promisfy => return a promise => use async await

  // console.log(decoded);

  //3) Check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new appError('the user no longer exists'), 401);
  }
  console.log(currentUser);

  //4) Check if user changed password after the token was issued
  // burada ise önce instance olarak userModel a yazacagız
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new appError('USER RECENTLY CHANGED PASSWORD'), 401);
  } // iat => issued At

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  next();
});

// LESSON ALERT IMPORTANT
//BURADA TOUR ROUTES A KOYDUGUMUZ DELETE ISLEMI ICIN SADECE BLEIRLI KULLANICLARIN IZINLI OLASMINI TASARLIYORUZ
// normalde herhangi bir middleware fonkısoyna arguman pass edilmez ama burada yapmamız gerke nasıl yapacagız ?

// BUNUN ICIN BİR "wrapper FONSKIYON " yapabilir (fonksıyon ıcınde fonskıyon) bu wrapper fonskıyon da direkt olarak middleware fonksıyonumuzu return eder
// wrappr fonskıyonumuzun ıcıne roles arreyını (...roles ) ile (rest parameter) yerleştirdik
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// LESSON FORGOT PASSWORD
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new appError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user => userModel middleware
  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token: token,
  });
});
