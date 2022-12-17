const express = require('express');
const app = require('../app');
const authController = require('../Controllers/authController');
const router = express.Router();
const viewController = require('./../Controllers/viewController');

router.use(authController.isLoggedIn);

router.get('/overview', viewController.getOverview);
router.get('/login', viewController.getLoginForm);
router.get('/tour/:slug', viewController.getTour);
module.exports = router;
