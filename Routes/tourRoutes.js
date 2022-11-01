const express = require('express');
const tourController = require('./../Controllers/tourController');
const router = express.Router();

// param middleware 5tane değer alır ve daha öcne yarattıgımız guard clasue gorevı gorur
// router.param('id', tourController.checkId);
// TOURS

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
// en ucuz en iyi 5 tur u sıralamak sıteyen bırısı buna tıkladıgında tourController.js dosyamızda export ettıgımız calısacak
// onu da middlewre olarak ekledık ?
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
