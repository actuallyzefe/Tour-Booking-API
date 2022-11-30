const mongoose = require('mongoose');

// review / rating / createdAt / ref to tour / ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // PARENT REFERENCING
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a User'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toOBJECT: {
      virtuals: true,
    },
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
