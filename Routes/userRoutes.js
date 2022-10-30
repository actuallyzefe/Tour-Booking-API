const express = require('express');
const userController = require('./../Controllers/userController');
// USERS

const router = express.Router();

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
