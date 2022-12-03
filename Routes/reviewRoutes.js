const express = require('express');
// IMPORTANT LESSON
const router = express.Router({ mergeParams: true }); // mergeParams ı bununiçine bir option olarak koyoruz
//
const authController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviewController');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getSpesificReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
