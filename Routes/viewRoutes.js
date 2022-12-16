const express = require('express');
const viewController = require('../Controllers/viewController');
const router = express.Router();

router.get('/').get(viewController.getOverview);
router.get('/tour').get(viewController.getTour);

module.exports = router;
