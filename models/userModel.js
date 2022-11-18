const { string } = require('i/lib/util');
const mongoose = require('mongoose');
const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Enter your Mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a valid Email'],
  },
  photo: String,

  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // THIS ONLY WORKS on CREATE and SAVE
      validator: function (el) {
        return el === this.password; // Bir boolean return etmek zorundayız. Eğer password ile confirmPassword = değilse validatorumuz calısacak
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
});

// IMPORTANT LESSON
// şifreleri encrypt etmek için mongooseMW kullanıyoruz. // NPM I BCRYPTJS
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // eğer ki password modified edilmemişse fonksıonun kalanını gormezden gel ve next() çalıştır

  this.password = await bcrypt.hash(this.password, 12); // en sonda yazdıgımız değer ne kadar guclu encrypt edecegını belırtır
  // ayrıca hash methodu async bir methoddur awairt etmemız gerekır
  // burada yaptıgımız sey ıse gırılen şifremizi encrypt edilmişe eşitledik

  this.passwordConfirm = undefined;
  // bu ise dataBase de istemediğmiz bir bilgi bu sadece kullanıcının şifresni yazarken hata yapmamsını sağlamak için koyduugmuz bir şey
  next();
});

// IMPORTANT LESSON
// Kullnacının girdiği password ile encrypt edilmiş passwordu karşılaştırma
// Instance method kullancagız => tum dokumanlarda kullanılabilir olan bir method

// ilk parametre orijinal Password 2. parametre hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Şimdi bu yarattığımız fonskıyonu authControllerda çalıştıracağız

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // eğer ki passwordChangedaT VARSA yani kullanıcnı şifresini değiştirmişse bu karşılaştırmayı yap eğer degıstırmemzıse return false
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false; // DEFAULT OLARAK FALSE RETURN ETTIRIDK
};

// unutma modellar büyük harfle belirtilir (genel kural)
const User = mongoose.model('User', userSchema);
module.exports = User;
