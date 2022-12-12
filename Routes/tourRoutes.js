const express = require('express');
const tourController = require('./../Controllers/tourController');
const router = express.Router();
const authController = require('./../Controllers/authController');
const reviewRouter = require('./../Routes/reviewRoutes');
// const reviewController = require('./../Controllers/reviewController');

// LESSON
// nested routes

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
// LESSON
router.use('/:tourId/reviews', reviewRouter); // burada eğer tourRouterımız böyle bir route ile karşılaşırsa reviewRouter ı kullanması gerektiğini söyledik
// Basicly  app.js de yaptıgımız route mounting ile aynı şey.
// Ama hala eksik olan şey ise reviewRouter ın tourId parametresine erişimi olmamasıdır. Bunu da reviewRoutes'da mergeParams ile halledeceğiz

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

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// IMPORTANT LESSON ALERT => GEOSPATIAL PART
// tours-within/:distance/ => şu mesafe içerisindeki turlar
// center/:latlng kişisel konumum
// unit/:unit => KM - MIle
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getSpesificTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
