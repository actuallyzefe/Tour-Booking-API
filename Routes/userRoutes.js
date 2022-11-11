const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/userController');

const router = express.Router();

// Users

router.route('/signup').post(authController.signup);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getSpesificUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
