// const { string } = require('i/lib/util');
const mongoose = require('mongoose');
// database imizi mongoose a express ile bağladıktan sonra Model oluştuduk
// Tıpkı OOP js gibi class oluşturur gibi yaptık bir şema oluşturduk
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  duration: {
    type: Number,
    require: [true, 'A tour must have duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price'],
  },
  priceDiscount: Number,

  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have SUMMARY'],
  },

  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have description'],
  },

  imageCover: {
    type: String,
    required: [true, 'A tour must have cover image'],
  },

  images: [String],

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // böylelikle kullancıya tour un ne zaman yaratıldıgını gızledık
  },

  startDates: [Date],
});
// Burada oluştududğumuz şemalara uygun documentler oluşturduk
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
