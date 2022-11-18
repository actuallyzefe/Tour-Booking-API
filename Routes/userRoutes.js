const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');

const router = express.Router();

// Users

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/login', authController.login);

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
