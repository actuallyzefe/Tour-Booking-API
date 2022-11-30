const express = require('express');
const router = express.Router();
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
