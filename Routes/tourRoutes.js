const express = require('express');
const tourController = require('./../Controllers/tourController');
const router = express.Router();
const authController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviewController');

// param middleware 5tane değer alır ve daha öcne yarattıgımız guard clasue gorevı gorur
// router.param('id', tourController.checkId);
// TOURS

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
// en ucuz en iyi 5 tur u sıralamak ısteyen bırısı buna tıkladıgında tourController.js dosyamızda export ettıgımız calısacak
// onu da middlewre olarak ekledık ?

router.route('/tour-stats').get(tourController.getToursStats);

// router
//   .route('/')
//   .get(tourController.getAllTours)
//   .post(tourController.createTour);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getSpesificTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// LESSON
// nested routes

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
module.exports = router;
