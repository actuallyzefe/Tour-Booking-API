const { string } = require('i/lib/util');
const mongoose = require('mongoose');
const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

// unutma modellar büyük harfle belirtilir (genel kural)
const User = mongoose.model('User', userSchema);
module.exports = User;
