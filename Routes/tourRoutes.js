const express = require('express');
const tourController = require('./../Controllers/tourController');
const router = express.Router();

// param middleware 5tane değer alır ve daha öcne yarattıgımız guard clasue gorevı gorur
// router.param('id', tourController.checkId);
// TOURS
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getSpesificTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
