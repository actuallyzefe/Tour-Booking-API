const express = require('express');
const authController = require('../Controllers/authController');
const router = express.Router();
const viewController = require('./../Controllers/viewController');

router.get('/overview', viewController.getOverview);
router.get('/tour/:slug', authController.protect, viewController.getTour);
router.get('/login', viewController.getLoginForm);
module.exports = router;
