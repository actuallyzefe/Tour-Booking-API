const express = require('express');
// IMPORTANT LESSON
const router = express.Router({ mergeParams: true }); // mergeParams ı bununiçine bir option olarak koyoruz
//
const authController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviewController');

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
